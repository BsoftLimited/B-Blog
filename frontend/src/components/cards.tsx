import { useSelector } from 'react-redux';
import { getUserSelector } from '../utils/store';
import {BiShow, BiCalendar, BiAlarm, BiChat} from "react-icons/bi";
import { Col } from "react-bootstrap";
import { Row } from "react-bootstrap";
import profile from '../assets/images/profile.png';
import Util from '../utils/util';
import { Post } from '../items/post';
import { UserState } from '../items/user';
import { Link } from 'react-router-dom';

const Cards = (props: {posts: Post[] }) =>{
    const userState: UserState = useSelector(getUserSelector);

    return(
        <Row>
            { props.posts.map((post) =>{
                const isMe = userState.user && userState.user.name === post.owner.name && userState.user.surname === post.owner.surname;
                return (
                    <Col lg={4} md={6} className='mb-3' key={post.id}>
                        <div style={{display: "flex"}}>
                            <div><img className="rounded-circle me-1 border border-2 bg-white" src={profile} width="50" height="50"/></div>
                            <div style={{float:"right", marginTop:"14px"}}>
                                <Link to={`posts/${post.id}`}><h5 style={{color: "grey"}}>{post.title}</h5></Link>
                                <div style={{display: "flex"}}>
                                    {post.categories.map((category) =>{
                                        return (<a className='p-1 me-1' style={{fontSize: "10px", color:"white", borderRadius:"10px", backgroundColor: `${Util.chooseColor()}`}} key={category.slurg} href={category.slurg}>{category.name}</a>)
                                    })}
                                </div>
                                { !isMe && (<label style={{fontSize:"14px"}}>{post.owner.name} {post.owner.surname}</label>) }
                                { isMe && (<label style={{fontSize:"14px"}}>Me</label>) }
                                
                                { !isMe && 
                                    (<div className='p-2 border border-2' style={{fontSize: "14px", letterSpacing:"1.3", borderRadius:"20px", borderTopLeftRadius:"0"}}>
                                        {post.message}
                                    </div>)
                                } 
                                { isMe && 
                                    (<div className='p-2 border border-2' style={{fontSize: "14px", letterSpacing:"1.3", borderRadius:"20px", borderTopRightRadius:"0"}}>
                                        {post.message}
                                    </div>)
                                } 
                                <div className='mt-2' style={{display: "flex", justifyContent:"space-between"}}>
                                    <label className="me-2" style={{fontSize:"12px"}}><BiShow className="text-primary me-1" size={24}/>{post.views}</label>
                                    <label className="me-2" style={{fontSize:"12px"}}><BiChat className="text-primary me-1" size={24}/>{post.comments}</label>
                                    <label className="me-2" style={{fontSize:"12px"}}><BiAlarm className="text-primary me-1" size={24}/>{Util.getTime(post.created)}</label>
                                    <label className="me-2" style={{fontSize:"12px"}}><BiCalendar className="text-primary me-1" size={24}/>{Util.getDate(post.created)}</label>
                                </div>
                            </div>
                        </div>
                    </Col>
                );
            }) }
        </Row>
    )
}

export default Cards;