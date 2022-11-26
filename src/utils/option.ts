export class Option<T>{
    private value: T | undefined;

    public constructor(value?: T){
        this.value = value;
    }

    public is_some(): boolean{ return this.value != undefined }
    public is_none(): boolean{ return this.value == undefined }

    public none(){ this.value = undefined; }
    public set(value: T){ this.value = value; }
    public unwrap(): T{ return this.value as T; }
}