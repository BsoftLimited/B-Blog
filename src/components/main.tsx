import { Component, ReactNode, useEffect } from "react";
import { Latest } from "./latest";
import { Posts } from "./posts";
import '../assets/styles/main.css';
import { Post } from "../items/post";
import { Json } from "../utils/util";
import { getPostSelector } from "../utils/store";
import { useSelector } from "react-redux";
import winter from '../assets/images/winter.svg';
import {BiComment, BiShow, BiCalendar, BiAlarm} from "react-icons/bi";
import { Carousel } from "react-bootstrap";

const months = ["January", "Feburary", "Match", "April", "May", "June", "July", "August", "September", "Octomber", "November", "December"];

function getDate(date: string):string{
    let init = new Date(date);
    let day = init.getDate().toString();
    

    let month = months[init.getMonth() - 1];
    return day + " " + month + " " + init.getFullYear();
}

function getTime(date: string):string{
    let init = new Date(date);
    return init.getHours() + ":" + init.getMinutes();
}

export const Main = () =>{
    let posts:Map<string, Post[]> =  Json.parse(useSelector(getPostSelector));

    useEffect(() =>{
        const features = document.querySelectorAll(".feature");
        features.forEach((feature) => {
            (feature as HTMLElement).onmouseover = function(){
                feature.classList.add("feature-select");
            };
            
            (feature as HTMLElement).onmouseout = function(){
                feature.classList.remove("feature-select");
            };
	    });
    }, []);

    const setCards = () =>{
        let cards = [];
        let init = posts.get("Latest") as Post[];
        const length = init.length > 4 ? 4 : init.length;
        for(let i = 0; i < length; i++){
            let post = init[i];
            cards.push(
                (<div className={"col-lg-3 col-md-6 slider-button point" + (i == 0 ? " active" : "")} data-bs-target="#myCarousel" data-bs-slide-to={i} aria-current="true" aria-label="Slide 1">
                    <div className={"card rounded slider-card" + (i === 0 ? " card-select" : "")}>
                        <img src={post.image ? post.image : winter} className="img-fluid rounded-top" alt="" />
                        <h6 className="ps-2 mt-2 headline-card-title">{post.title}</h6>
                        <div className="d-flex justify-content-between m-2">
                            <label className={(i === 0 ? 'text-light ' : '') + "slider-card-category headline-card-caption"}>{ post.category }</label>
                            <label className={(i === 0 ? 'text-light ' : '') + "slider-card-date headline-card-caption"}><BiCalendar />{getDate(post.time)}</label>
                        </div>
                    </div>
                </div>)
            );
        }
        return cards;   
    }
    
    const setLatest = () =>{
        let latest = [];
        let init = posts.get("Latest") as Post[];
        for(let i = 4; i < init.length; i++){
            let post = init[i];
            latest.push(
                (<div className="feature p-2" key = {i}>
                    <a>
                        <label>{post.category}</label>
                        <h6 className="latest-title">{post.title}</h6>
                        <div className="text-end">
                            <label>
                                <label className="text-light-muted me-2 latest-icon-label"><BiShow className="text-primary me-1" size={16}/>{post.views}</label>
                                <label className="text-light-muted me-2 latest-icon-label"><BiComment className="text-primary me-1" size={16}/>{post.comments.length}</label>
                                <label className="text-light-muted me-2 latest-icon-label"><BiAlarm className="text-primary me-1" size={16}/>{getTime(post.time)}</label>
                                <label className="text-light-muted me-2 latest-icon-label"><BiCalendar className="text-primary me-1" size={16}/>{getDate(post.time)}</label>
                            </label>
                        </div>
                    </a>
                </div>)
            );
            i < init.length - 1 && latest.push((<hr />));
        }
        
        return latest;
    }
    
    return(
        <div className="container">
            <h3 className="text-blue headline">Today's Headlines</h3>
            <div className="row">
                <div className="col-lg-9">
                    <div className="row" id="cards-container">{ setCards() }</div>
                    <Carousel className="p-3">
                        <Carousel.Item interval={5000}>
                            <img className="d-block w-100" src={winter} alt="Image One" />
                            <Carousel.Caption className="active">
                                <h3>Label for first slide</h3>
                                <p>Sample Text for Image One</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item interval={5000}>
                            <img className="d-block w-100" src={winter} alt="Image Two"/>
                            <Carousel.Caption className="active">
                                <h3>Label for second slide</h3>
                                <p>Sample Text for Image Two</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </div>
                <div className="col-lg-3">
                    <div className="border shadow px-2 pb-2" id="latests">
                        <h5 className="text-blue mt-2 latest">Latests</h5>
                        { setLatest() }
                    </div>
                </div>
            </div>
            <div id="main">

            </div>    
        </div>);
}