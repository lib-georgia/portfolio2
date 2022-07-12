import React,{useState,useCallback,useEffect} from 'react';
import { SideBar } from '../components';
import TextBox from '../components/UIkit/TextBox';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useAuthContext } from './AuthContext';
import Style from './styles/Message.module.scss';
import { db } from '../firebase';

const Message = () => {
    const { user } = useAuthContext();
    const uid = user.uid;
    const [message, setMessage] = useState("");
    const inputMessage = useCallback((event) => { setMessage(event.target.value) }, [setMessage]);

    const [friends, setFriends] = useState("");
    useEffect(() => {
        if (user !== "") {
            db.collection("user").doc(uid).collection("friend").get().then((query) => {
                const friend = [];
                query.forEach((doc) => {
                    const data = doc.data();
                    friend.push({friendId: doc.id, name: data.name});
                });
                setFriends(friend);
              })
              .catch((error)=>{
                console.log(`データの取得に失敗しました (${error})`);
              });
       }
    }, [user,uid])

    const [messages, setMessages] = useState("");
    const [choiceFriendId, setChoiceFriendId] = useState("");
    useEffect(() => {
        if (user !== "" && choiceFriendId !== "") {
            db.collection("user").doc(uid).collection("friend").doc(choiceFriendId).collection('message').get().then((query) => {
                var message = [];
                query.forEach((doc) => {
                  var data = doc.data();
                  message.push({friendId:doc.id,message:data.message});
                });
                setMessages(message);
              })
              .catch((error)=>{
                console.log(`データの取得に失敗しました (${error})`);
              });
       }
    }, [user,uid,choiceFriendId])
    
    if (!user) {
        window.location.href="/signin";
    } else {
        return (
            <div className={Style.message_bx}>
                <div className={Style.sidebar_bx}>
                    <SideBar />
                </div>
                <div className={Style.message_inner}>
                    <div className={Style.inner}>
                    {choiceFriendId ?
                        <div className={Style.message_showBx}>
                            {messages.length > 0 && (
                                messages.map((list,index) => (
                                    <ul key={index}>
                                        <li onClick={() => setChoiceFriendId(list.friendId)}>
                                            <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                                <Avatar alt="name" src="/static/images/avatar/1.jpg" className={Style.avatar} />
                                            </Stack>
                                            <p>{list.message}</p>
                                        </li>
                                    </ul>
                                )))}
                        </div> :
                        <div className={Style.message_showBx}>
                            {friends.length > 0 && (
                                friends.map((list) => (
                                    <ul key={list.friendId}>
                                        <li onClick={() => setChoiceFriendId(list.friendId)}>
                                            <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                                <Avatar alt="name" src="/static/images/avatar/1.jpg" className={Style.avatar} />
                                            </Stack>
                                            <p>{list.name}</p>
                                        </li>
                                    </ul>
                                )))}
                        </div>
                    }
                    <div className={Style.message_submitBx}>
                        <div className={Style.left}>
                            <TextBox className={'inputBx'} label={'メッセージ'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={message} onChange={inputMessage} />
                        </div>
                        <div className={Style.right}>
                            <div className={Style.submitBtn}>送信</div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        ) 
      }
}
export default Message;