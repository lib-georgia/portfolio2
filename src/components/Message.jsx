import React,{memo,useState,useEffect,useCallback} from 'react';
import { sendMessage } from '../apis';
import { db, FirebaseTimestamp } from '../firebase';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import TextBox from './UIkit/TextBox';
import Style from './styles/Message.module.scss';

const Message = memo((props) => {
    const { user,choiceFriendId,userData,setOpenMessage,closeMessage } = props;
    const [messageFriendName, setMessageFriendName] = useState("");
  const [messages, setMessages] = useState("");

    const [newMessage, setNewMessage] = useState("");
    const inputNewMessage = useCallback((event) => { setNewMessage(event.target.value) }, [setNewMessage]);
    const timestamp = FirebaseTimestamp.now();
    const number = (date) => {
        return date.getFullYear() + ('00' + (date.getMonth() + 1)).slice(-2) + ('00' + date.getDate()).slice(-2) + ('00' + date.getHours()).slice(-2) + ('00' + date.getMinutes()).slice(-2)
    };
    const dateToString = (date) => {
        return ('00' + (date.getMonth() + 1)).slice(-2) + '/' + ('00' + date.getDate()).slice(-2)
    }
    const timesToString = (date) => {
        return ('00' + date.getHours()).slice(-2) + ":" + ('00' + date.getMinutes()).slice(-2)
    }
    const sendNumber = number(timestamp.toDate());
    const date = dateToString(timestamp.toDate());
    const time = timesToString(timestamp.toDate());

    useEffect(() => {
        const uid = user.uid;
        if (messages !== "") {
          db.collection("user").doc(uid).collection("friend").doc(choiceFriendId).get().then((doc)=>{
            if (doc.exists) {
              const data = doc.data();
              setMessageFriendName(data.name);
              setOpenMessage(true);
            }
            else {
              console.log("404");
            }
          })
          .catch( (error) => {
              console.log(`データを取得できませんでした (${error})`);
          });
        } else {
          return false;
        }
      },[user,messages,choiceFriendId,setOpenMessage])

      useEffect(() => {
        if (user !== "" && choiceFriendId !== "") {
            const uid = user.uid;
            db.collection("user").doc(uid).collection("friend").doc(choiceFriendId).collection('message').orderBy("sendNumber", "asc").onSnapshot((snapshot) => {
              const myArray = [];
              snapshot.forEach((doc) => {
                  const data = doc.data();
                  myArray.push({
                      id: doc.id,
                      message: data.message,
                      sendParson: data.sendParson,
                      time: data.time,
                      sendNumber:data.sendNumber
                  });
              });
              setMessages(myArray)
          });
        } else {
            return false;
        }
    },[user,choiceFriendId])

      useEffect(() => {
    const scrollArea = document.getElementById('scroll-area');
    if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
    }
      });
  
    return (
      <div className={Style.message_bx_wrapper}>
      <div className={Style.choiceFriendName}>
        <Stack direction="row" spacing={2} className={Style.avatar_bx}>
        <Avatar src="/broken-image.jpg" className={Style.avatar} />
        </Stack>
        <p>{messageFriendName}</p>
      </div>
      <div className={Style.message_bx_inner} id="scroll-area">
                <ul className={Style.openMessage_bx}>
                    {messages.length > 0 && (
                        messages.map((list,index) => (
                            <React.Fragment key={index}>
                                {(() => {
                                    if (user.uid !== list.sendParson) {
                                        return <li className={Style.friendMessage}>
                                            <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                            <Avatar src="/broken-image.jpg" className={Style.avatar} />
                                            </Stack>
                                            <p className={Style.friendTxt}>{list.message}<span></span></p>
                                            </li>
                                    } else {
                                        return <li className={Style.myMessage}>
                                            <p className={Style.friendTxt}>{list.message}<span></span></p>
                                        <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                            {(() => {
                                              if (userData.images !== "") {
                                                return <Avatar alt={userData.images.id} src={userData.images.path} className={Style.avatar} />
                                              } else {
                                                return <Avatar src="../../public/no-images.jpeg" className={Style.avatar} />
                                              }
                                            })()}
                                        </Stack>
                                        </li>
                                    }
                                })()}
                            </React.Fragment>
                        ))
                    )}
                </ul>
                <div className={Style.message_submitBx}>
                    <div className={Style.left}>
                        <TextBox className={'inputBx'} label={'メッセージ'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={newMessage} onChange={inputNewMessage} />
                    </div>
                    <div className={Style.right} onClick={() => { sendMessage(user.uid, newMessage, choiceFriendId, sendNumber, time, date); setNewMessage("")}}>
                        <div className={Style.submitBtn}><span className="material-icons-outlined">send</span></div>
                    </div>
          </div>
          <div className={Style.messageCloseBtn} onClick={closeMessage}>閉じる</div>
    </div>
    </div>
    )
})

export default Message;