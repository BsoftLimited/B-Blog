export class JsonException extends Error{
    constructor(message: string){
        super(message);
    }
}

export abstract class Json<T>{
	public abstract get(value: T): JsonArray | JsonObject | JsonPrimitive | undefined;
    public abstract remove(value: T) : boolean;
    public abstract has(value: T): boolean;
    public abstract size(): number;
    public abstract clear(): void;
    public abstract isEmpty(): boolean;

    public getPrimitive(key: T) : JsonPrimitive {
        let init = this.get(key);
        if(init instanceof JsonPrimitive) {
            return init;
        }
        throw new JsonException("the value is not of type JSON Primitive");
    }

    public getDataObject(key: T) : JsonObject {
        let init = this.get(key);
        if(init instanceof JsonObject) {
            return init;
        }
        throw new JsonException("the value is not of type JSON Object");
    }

    public getDataArray(key: T): JsonArray {
        let init = this.get(key);
        if(init instanceof JsonArray) {
            return init;
        }
        throw new JsonException("the value is not of type JSON Array");
    }

    public isPrimitive(key: T): boolean{
        return this.get(key) instanceof JsonPrimitive;
    }

    public isObject(key: T): boolean{
        return this.get(key) instanceof JsonObject;
    }

    public isArray(key: T): boolean{
        return this.get(key) instanceof JsonArray;
    }

    public abstract stringify(): string;
}

export class JsonArray extends Json<number>{
    private data: Array<JsonObject| JsonArray | JsonPrimitive>;

    constructor(){
        super();
        this.data = [];
    }

    public add(value:  JsonObject| JsonArray | JsonPrimitive | number | boolean | string){
        if(typeof value === "boolean" || typeof value === "number" || typeof value === "string"){
            this.data.push( new JsonPrimitive(value));   
        }else{
            this.data.push(value);
        }
    }

    public get(value: number) :JsonArray | JsonObject | JsonPrimitive | undefined{
        return this.data[value];
    }
    public remove(value: number): boolean {
        return this.data.splice(value, 1).length > 0;
    }
    public has(value: number): boolean {
        return this.data.length - 1 > value;
    }
    public size(): number {
        return this.data.length;
    }
    public clear(): void {
        this.data = [];
    }
    
    public isEmpty(): boolean {
        return this.data.length == 0;
    }

    public stringify(): string {
        let builder = "[";
        let index = 0;
        this.data.forEach((value)=>{
            builder += value.stringify();
			if(index < this.data.length - 1){ builder += ", "; }
            index += 1;
        });
        return builder + ']';
    }
}

export class JsonObject extends Json<string>{
    private data: Map<string, JsonObject| JsonArray | JsonPrimitive>;

    constructor(){
        super();
        this.data = new Map();
    }

    public set(key:string, value:  JsonObject| JsonArray | JsonPrimitive | number | boolean | string){
        if(typeof value === "boolean" || typeof value === "number" || typeof value === "string"){
            this.data.set(key, new JsonPrimitive(value));   
        }else{
            this.data.set(key, value);
        }
    }

    public get(value: string) :JsonArray | JsonObject | JsonPrimitive | undefined {
        return this.data.get(value);
    }
    public remove(value: string): boolean {
        return this.data.delete(value);
    }
    public has(value: string): boolean {
        return this.data.has(value);
    }
    public size(): number {
        return this.data.size;
    }
    public clear(): void {
        return this.data.clear();
    }
    public isEmpty(): boolean {
        return this.data.size == 0;
    }

    public stringify(): string {
        let builder = "{";
        let index = 0;
        this.data.forEach((value, key)=>{
            builder += '"' + key + '" : ' + value.stringify();
			if(index < this.data.size - 1){ builder += ", "; }
            index += 1;
        });
        return builder + '}';
    }
}

export class JsonPrimitive{
    data: any;
    constructor(data: any){
        this.data = data;
    }

    public asBoolean() : boolean {
        if(typeof this.data == "boolean") {
            return this.data as boolean;
        }else if(typeof this.data == "string") {
            if(this.data === '0' || this.data === 'false' || this.data.length <= 0){
                return false;
            }
            return true;
        }else if(typeof this.data == "number") {
            return (this.data as number) > 0;
        }
        return false;
    }

    public asNumber() : number{
        if(typeof this.data == "boolean") {
            return (this.data as boolean) ? 1 : 0;
        }else if(typeof this.data == "string") {
            return Number.parseInt(this.data);
        }else if(typeof this.data == "number") {
            return this.data as number;
        }
        throw new JsonException("the value is not of type Integer");
    }

    public asString() : JsonException | string{
        if(typeof this.data == "boolean") {
            return (this.data as boolean) ? "true" : "false";
        }else if(typeof this.data == "string") {
            return this.data as string;
        }else if(typeof this.data == "number") {
            return (this.data as number).toString();
        }
        throw new JsonException("the value is not of type String");
    }

    public unwrap(): any { return this.data; }

    public stringify(): string{
        if(typeof this.data == "boolean") {
            return this.data ? 'true' : 'false';
        }else if(typeof this.data == "string") {
            return '"' + this.data + '"';
        }
        return this.data.toString();
    }
}
