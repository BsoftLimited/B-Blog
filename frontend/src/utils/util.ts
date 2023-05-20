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
    public static months = ["January", "Feburary", "Match", "April", "May", "June", "July", "August", "September", "Octomber", "November", "December"];
    public static colors = ["#4F8CD2", "#D1273B", "#FF9155", "#49AD2C", "#B7579D", "grey"]

    public static getDate(date: string):string{
        let init = new Date(date);
        let day = init.getDate().toString();
        
    
        let month = Util.months[init.getMonth() - 1];
        return day + " " + month + " " + init.getFullYear();
    }
    
    public static getTime(date: string):string{
        let init = new Date(date);
        return init.getHours() + ":" + init.getMinutes();
    }
    
    public static chooseColor = () =>{
        const index =  Math.floor(Math.random() * Util.colors.length);
        return Util.colors[index];
    }
}