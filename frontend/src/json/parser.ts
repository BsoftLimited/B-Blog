import { Option } from "../utils/option";
import { Character } from "../utils/util";
import { JsonArray, JsonException, JsonObject, JsonPrimitive } from "./json";
import { BooleanToken, CharToken, CharType, NumberToken, StringToken, Token } from "./token";



class JSONLexer{
	data: string;
	current: string;
	index: number;
	
	constructor(data: string){
		this.data = data;
		this.index = 0;
		this.current = data.charAt(this.index);
	}
	
	public hasNext(){
		while(this.index < this.data.length){
			this.current = this.data.charAt(this.index);
			let passable = Character.is_whitespace(this.current);
			if(!passable){ return true; }
			this.index++;
		}
		return false;
	}
	
	pop(): string{
		let init = this.current;
		this.current = this.data.charAt(++this.index);
		return init;
	}
	
	nextToken(): Token<any>{
		if(Character.isAlphbetic(this.current)){
			return this.getBooleanToken();
		}else if(Character.isNumeric(this.current)){
			return this.getNumberToken();
		}else if(this.current === '"' || this.current === "'"){
			return this.getStringToken();
		}else{
			return new CharToken(this.pop());
		}
	}
	
	private getStringToken(): StringToken{
		let init = this.pop();
		let builder = "";
		while(this.index < this.data.length){
			if( this.data.charAt(this.index) === init){
				this.pop();
				return new StringToken(builder);
			}else{
				builder += this.pop();
			}
		}
		throw new JsonException("Unexpected end of token, expecting an ' or \" after " + builder.toString());
	}
	
	private getNumberToken(): NumberToken{
		let builder = this.pop();
		while(this.index < this.data.length && (Character.isNumeric(this.current) || this.current == '.')){
			builder += this.pop();
		}
		try{
			return new NumberToken(Number.parseFloat(builder));
		}catch(ex){
			throw new JsonException("Invalid token: " + builder);
		}
	}
	
	private getBooleanToken(): BooleanToken{
		let builder = this.pop();
		while(this.index < this.data.length && Character.isAlphbetic(this.current)){
			builder += this.pop();
		}
		if(builder === "true" || builder === "false"){
			return new BooleanToken(builder === "true");
		}
		throw new JsonException("Wrap token " + builder.toString() + " inside two \" or '");
	}
}

export class JsonParser{
	private lexer: JSONLexer;
	private current?: Token<any>;
	private constructor(data: string){
		this.lexer = new JSONLexer(data);
	}

	private init(): JsonObject | JsonArray | JsonPrimitive{
		if(this.nextToken()){
			return this.check();
		}
		throw new JsonException("Unexpected end of JSON object");
	}

	private nextToken(): boolean{
		if(this.lexer.hasNext()){
			this.current = this.lexer.nextToken();
			console.log(this.current.toString());
			return true;
		}else{
			this.current = undefined;
		}
		return false;
	}

	private check(): JsonObject | JsonArray | JsonPrimitive{
		if(this.current instanceof StringToken){
			return new JsonPrimitive(this.current.getValue());
		}else if(this.current instanceof NumberToken){
			return new JsonPrimitive(this.current.getValue());
		}else if(this.current instanceof BooleanToken){
			return new JsonPrimitive(this.current.getValue());
		}else if(this.current instanceof CharToken){
			switch(this.current.getType()){
				case CharType.OpenSquareBracket:
					return this.getArray();
				case CharType.OpenCurlyBracket:
					return this.getObject();
			}
		}
		throw new JsonException("Unexpected token found: " + this.current?.getValue());
	}

	public static parse(data: string): JsonObject | JsonArray | JsonPrimitive{
		let parser = new JsonParser(data);
		return parser.init();
	}
	
	private getObject(): JsonObject{
		let initObject = new JsonObject();
		let key = new Option<string>();

		while(this.nextToken()){
			if(this.current instanceof StringToken && key.is_none()){
				key.set(this.current.getValue());
			}else if(this.current instanceof CharToken){
				switch(this.current.getType()){
					case CharType.Colon:
						if(key.is_some() && this.nextToken()){
							initObject.set(key.unwrap(), this.check());
						}else{
							throw new JsonException("unexpected colon(':') encounterd, expecting key");
						}
						break;
					case CharType.Coma:
						key.none();
						break;
					case CharType.CloseCurlyBracket:
						return initObject;
				}
			}
		}
		throw new JsonException("Unexpected end of object definition, expecting }");
	}
	
	private getArray(): JsonArray{
		let initArray = new JsonArray();
		let proceed = true;
		while(this.nextToken()){
			if(proceed){
				initArray.add(this.check());
				proceed = false;
			}else if(this.current instanceof CharToken){
				switch(this.current.getType()){
					case CharType.Coma:
						proceed = true;
						break;
					case CharType.CloseSquareBracket:
						return initArray;
					default:
						throw new JsonException("Unexpected token (" + this.current + ") encountered");
				}
			}
		}
		throw new JsonException("Unexpected end of array definition, expecting ]");
	}
}