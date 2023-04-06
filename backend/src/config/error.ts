import { Response, Router } from "express";

interface Err{
    error: string, message: string
}

export default class ErrorHandler{
    private errors: Map<number, Err[]>;
    
    public constructor(){
        this.errors = new Map();
    }
    
    add(code: number, error: string, message: string): void{
        const init: Err = { error: error, message: message };
        if(this.errors.has(code)){
            this.errors.get(code)?.push(init);
        }else{
            this.errors.set(code, [init]);
        }
    }
    
    display(response: Response){
        this.errors.forEach((values, code) =>{
            values.forEach((value) =>{
                return response.status(code).json({"message": value.message});
            });
        });
        return response.status(500).json({"message": "obsolute server breakdown"});
    }
    
    has_error(): boolean{
        return this.errors.size > 0;
    }
}