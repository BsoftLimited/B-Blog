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
        if(this.errors.size > 0){
            let init: {code: number, message: string} | undefined;
            this.errors.forEach((values, code) =>{
                values.forEach((value) =>{
                    console.log(value.error + "\n");
                    if(init === undefined){
                        init = { code: code, message: value.message };
                    }
                });
            });

            if(init){
                return response.status(init.code).json({"message": init.message});
            }
        }
        return response.status(500).json({"message": "obsolute server breakdown"});
    }
    
    has_error(): boolean{
        return this.errors.size > 0;
    }
}