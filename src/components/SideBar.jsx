import React,{useState,useEffect,useCallback,memo} from 'react';
import Style from './styles/SideBar.module.scss';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { db,FirebaseTimestamp } from '../firebase';
import { useAuthContext } from '../pages/AuthContext';
import TextBox from './UIkit/TextBox'; 
import { friendRequest } from '../apis';
import Logo from '../asset/logo.png';

const SideBar = memo((props) => {
    const { user } = useAuthContext();
    const [isOpenFriendList, setIsOpenFriendList] = useState(false);
    const [friends, setFriends] = useState("");
    useEffect(() => {
        if (user !== "") {
            const uid = user.uid;
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
    }, [user])

    const [request, setRequest] = useState("");
    useEffect(() => {
        if (user !== "") {
            const uid = user.uid;
            db.collection("user").doc(uid).collection("request").get().then((query) => {
                const friend = [];
                query.forEach((doc) => {
                    const data = doc.data();
                    friend.push({friendId: doc.id, name: data.requestFriendName,date:data.requestDate});
                });
                setRequest(friend);
              })
              .catch((error)=>{
                console.log(`データの取得に失敗しました (${error})`);
              });
       }
    }, [user])

    const friendToggleBtn = () => {
        if (isOpenFriendList === false) {
            setIsOpenFriendList(true);
        } else {
            setIsOpenFriendList(false);
        }
    }

    const timestamp = FirebaseTimestamp.now();
    const dateToString = (date) => {
        return date.getFullYear() + '年' + ('00' + (date.getMonth() + 1)).slice(-2) + '月' + ('00' + date.getDate()).slice(-2) + '日' + ('00' + date.getHours()).slice(-2) + ':' + ('00' + date.getMinutes()).slice(-2)
    };
    const date = dateToString(timestamp.toDate());

    const [friendId, setFriendId] = useState("");
    const inputFriendId = useCallback((event) => { setFriendId(event.target.value) }, [setFriendId]);
    const [showFindFriend, setShowFindFriend] = useState(false);
    const [surveillance, setSurveillance] = useState(false);
    
    useEffect(() => {
        if (friendId !== "" && showFindFriend === true && surveillance === true) {
            db.collection('user').doc(friendId).collection('request').onSnapshot((snapshot) => {
                snapshot.forEach((doc) => {
                    if (doc.id === props.uid) {
                        setFriendId("");
                        setShowFindFriend(false);
                        alert('完了')
                    }
                });

            });
        }
    },[showFindFriend,friendId,props.uid,surveillance])

    const { requestFriend } = props;

    return (
        <div className={Style.sidebar_bx}>
            <div className={Style.ovf}>
                <div className={Style.sidebar_left}>
                    <div className={Style.logo}><img src={Logo} alt="logo" /></div>
                <div className={Style.linkPeople}>
                        <div onClick={friendToggleBtn}><span className="material-icons-outlined">people</span><p>友だち</p></div>
                        <div onClick={props.showProfile}><span className="material-icons-outlined">account_circle</span><p>プロフィール</p></div>
                        <div onClick={props.myLocation}><span className="material-icons-outlined">account_circle</span><p>自分の位置</p></div>
                </div>
                <div className={Style.getLocation}>
                    <span className="material-icons-outlined" onClick={props.signOut}>logout</span>
                </div>
                </div>
                {isOpenFriendList && (
                    <div className={Style.sidebar_right}>
                        <ul>
                            <li className={Style.friendSearch}>
                                <TextBox className={'inputFriend'} label={'IDで友だち検索'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={friendId} onChange={inputFriendId} />
                                <span className="material-icons-outlined" onClick={() => { props.showSearchFriend(friendId); setShowFindFriend(true)}}>search</span>
                            </li>
                            {showFindFriend && (
                                <li className={Style.findFriend}>
                                    <h2>{props.findFriendName}</h2>
                                    <div onClick={() => { friendRequest(friendId, props.name, props.uid, date); setSurveillance(true);}}><span className="material-icons-outlined">send</span>リクエスト</div>
                                </li>
                            )}
                            {request.length > 0 && <li className={Style.friendLstTtl}>リクエスト</li>}
                            {request.length > 0 && (
                                request.map((list) => (
                                    <li key={list.friendId} className={Style.friendList} onClick={() => requestFriend(list.friendId)}>
                                        <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                            <Avatar src="/static/images/avatar/1.jpg" className={Style.avatar} />
                                        </Stack>
                                        <p>{list.name}</p>
                                    </li>
                                ))
                            )}
                            <li className={Style.friendLstTtl}>友だち</li>
                            {friends.length > 0 && (
                                friends.map((list) => (
                                    <li key={list.friendId} onClick={() => props.onClick(list.friendId)} className={Style.friendList}>
                                        <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                            <Avatar src="/static/images/avatar/1.jpg" className={Style.avatar} />
                                        </Stack>
                                        <p>{list.name}</p>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
  });

  export default SideBar;