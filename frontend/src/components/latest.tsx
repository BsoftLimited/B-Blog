import { UserState } from "../items/user";
import { getUserSelector } from "../utils/store";
import { Post } from "../items/post";
import { BiAlarm, BiCalendar } from "react-icons/bi";
import { useSelector } from "react-redux";
import profile from '../assets/images/profile.png';
import Util from "../utils/util";

const Latest = (props: {posts: Post[]}) =>{
    const userState: UserState = useSelector(getUserSelector);

    return (
        <div>
            {props.posts.map((post) =>{
                const isMe = userState.user && userState.user.name === post.owner.name && userState.user.surname === post.owner.surname;

                return (
                    <div  className='mt-4' style={{display: "flex"}} key={post.id}>
                        <div><img className="rounded-circle me-1 border border-2 bg-white shadow" src={profile} width="50" height="50"/></div>
                        <div style={{float:"right", marginTop:"14px"}}>
                            <h6>{post.title}</h6>
                            { !isMe && (<label style={{fontSize:"14px"}}>{post.owner.name} {post.owner.surname}</label>) }
                            { isMe && (<label style={{fontSize:"14px"}}>Me</label>) }
                            { !isMe && 
                                (<div className='p-2 shadow' style={{fontSize: "12px", letterSpacing:"1.3", borderRadius:"20px", borderTopLeftRadius:"0"}}>
                                    {post.message}
                                    <div className='mt-2' style={{display: "flex", justifyContent:"flex-end"}}>
                                        <label className="me-2" style={{fontSize:"12px"}}><BiAlarm className="text-primary me-1" size={24}/>{Util.getTime(post.created)}</label>
                                        <label className="me-2" style={{fontSize:"12px"}}><BiCalendar className="text-primary me-1" size={24}/>{Util.getDate(post.created)}</label>
                                    </div>
                                </div>)
                            } 
                            { isMe && 
                                (<div className='p-2 shadow' style={{fontSize: "12px", letterSpacing:"1.3", borderRadius:"20px", borderTopRightRadius:"0"}}>
                                    {post.message}
                                    <div className='mt-2' style={{display: "flex", justifyContent:"flex-end"}}>
                                        <label className="me-2" style={{fontSize:"12px"}}><BiAlarm className="text-primary me-1" size={24}/>{Util.getTime(post.created)}</label>
                                        <label className="me-2" style={{fontSize:"12px"}}><BiCalendar className="text-primary me-1" size={24}/>{Util.getDate(post.created)}</label>
                                    </div>
                                </div>)
                            }
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

export default Latest;