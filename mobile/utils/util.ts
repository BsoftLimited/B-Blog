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