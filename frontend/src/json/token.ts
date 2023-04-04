import { JsonException } from "./json";

export enum CharType{ OpenSquareBracket, OpenCurlyBracket, CloseSquareBracket, CloseCurlyBracket, Coma, Colon}

export abstract class Token<T>{
    private value: T;

    constructor(value: T){
		this.value = value;
    }

    getValue(): T{ return this.value; }
    abstract toString(): string; 
}

export class CharToken extends Token<string>{
    private charType: CharType;
	constructor(value:string){
		super(value);

        switch(value){
            case "[":
                this.charType = CharType.OpenSquareBracket;
                break;
            case "]":
                this.charType = CharType.CloseSquareBracket;
                break;
            case "{":
                this.charType = CharType.OpenCurlyBracket;
                break;
            case "}":
                this.charType = CharType.CloseCurlyBracket;
                break;
            case ":":
                this.charType = CharType.Colon;
                break;
            case ",":
                this.charType = CharType.Coma;
                break;
            default:
                throw new JsonException("Unexpected token: " + value);
        }
	}

    getType(): CharType{ return this.charType; }

    toString(): string {
        return "char token: value(" + this.getValue() + ")";
    }
}

export class BooleanToken extends Token<boolean>{
	constructor(value:boolean){
		super( value);
	}

    toString(): string {
        return "boolean token: value(" + this.getValue() + ")";
    }
}

export class NumberToken extends Token<number>{
	constructor(value:number){
		super( value);
	}

    toString(): string {
        return "number token: value(" + this.getValue() + ")";
    }
}

export class StringToken extends Token<string>{
	constructor(value:string){
		super(value);
	}

	toString(): string {
		return "Type: String value: '" + this.getValue() + "'";
	}
}