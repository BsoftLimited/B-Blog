import { Post } from "../items/post";

export class Json{
    static stringify(map: Map<string, Post[]>):string{
        return JSON.stringify(Object.fromEntries(map));
    }

    static parse(data: string): Map<string, Post[]>{
        return new Map(Object.entries(JSON.parse(data)));
    }
}

export class Character{
    static isAlphbetic(char: number | string): boolean{
        if(typeof char === 'number'){
            let value = (char as number);
            return (value >= 65 && value <= 90) || (value >= 97 && value <= 122);
        }else if (typeof char === 'string' && char.length == 1){
            let value = char.charCodeAt(0);
            return (value >= 65 && value <= 90) || (value >= 97 && value <= 122);
        }
        return false;
    }

    static isNumeric(char: number | string): boolean{
        if(typeof char === 'number'){
            return char >= 48 && char <= 57;
        }else if (typeof char === 'string' && (char as string).length == 1){
            let value = char.charCodeAt(0);
            return value >= 48 && value <= 57;
        }
        return false;
    }

    static isAlphaNumeric(char: number | string): boolean{
        return this.isAlphbetic(char) || this.isNumeric(char);
    }

    static is_whitespace(char: string): boolean{
        return [' ', '\n', '\t'].includes(char);
    }
}

export default class Util{
    public static HomeUrl = "http://localhost:8000/";
}