import { useState } from 'react';
import {Form, FormControl, FormFloating, FormLabel, Container} from 'react-bootstrap';
import { JsonArray } from '../json/json';
import { JsonParser } from '../json/parser';

interface Image{
    width?: number,
    height?: number, 
    name: string,
    path: string
}

interface Paragraph{
    text:string,
    image?: Image, 
}

class Paragraphs{
    children: Paragraph[];

    private constructor(){
        this.children = [];
    }

    static parse(data: string): Paragraphs{
        let paragraphs = new Paragraphs();
        return paragraphs;
    }
}

export const Create = () =>{
    const [state, setState] = useState<object[]>([
        {type:"image", path:"", name:"bobby"},
        {type:"paragraph", children:[

        ]}
    ]);

    let json = JsonParser.parse("[78, 56, 'bobby', { 'name' : 'nobel', 'age' : 23}]");
    console.log(json.stringify());
    if(json instanceof JsonArray){
        for(let i = 0; i < json.size(); i++){
            if(json.isPrimitive(i)){
                console.log(json.get(i)?.stringify());
            }else if(json.isObject(i)){
                console.log(json.get(i)?.stringify());
            }
        }
    }

    return(<div>
        <Container>
            <h2></h2>
            <Form className="row m-2">
                <FormLabel className='text-lg'>Create An Article</FormLabel>
                <FormFloating className='col-lg-4 px-2'>
                    <FormControl placeholder='Category' required/>
                    <FormLabel title='category'>Category</FormLabel>
                </FormFloating>
                <FormFloating className='col-lg-8 px-2'>
                    <FormControl placeholder='Title' required/>
                    <FormLabel title='title'>Title</FormLabel>
                </FormFloating>
            </Form>
        </Container>
    </div>);
}