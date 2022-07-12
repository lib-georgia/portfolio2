import React,{memo,useState,useEffect,useCallback} from 'react';
import { db,FirebaseTimestamp } from '../firebase';
import TextBox from './UIkit/TextBox';
import { useAuthContext } from '../pages/AuthContext';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { friendRequest } from '../apis';
import Style from './styles/FriendList.module.scss';

const FriendList = memo((props) => {
    const { requestFriend,friendBtn,menuToggle } = props;
    const { user } = useAuthContext();
    const uid = user.uid;
    const closeMenuBtn = () => { friendBtn(); menuToggle(); }
    const [friendId, setFriendId] = useState("");
    const inputFriendId = useCallback((event) => { setFriendId(event.target.value) }, [setFriendId]);
    const timestamp = FirebaseTimestamp.now();
    const dateToString = (date) => {
        return date.getFullYear() + '年' + ('00' + (date.getMonth() + 1)).slice(-2) + '月' + ('00' + date.getDate()).slice(-2) + '日' + ('00' + date.getHours()).slice(-2) + ':' + ('00' + date.getMinutes()).slice(-2)
    };
    const date = dateToString(timestamp.toDate());
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

    const [request, setRequest] = useState("");
    useEffect(() => {
        db.collection("user").doc(uid).collection("request").get().then((query) => {
            const friend = [];
            query.forEach((doc) => {
                const data = doc.data();
                friend.push({friendId: doc.id, name: data.requestFriendName,date:data.requestDate,requestImages:data.requestImages});
            });
            setRequest(friend);
          })
          .catch((error)=>{
            console.log(`データの取得に失敗しました (${error})`);
          });
    }, [uid])

    const [friends, setFriends] = useState("");
    useEffect(() => {
        db.collection("user").doc(uid).collection("friend").get().then((query) => {
            const friend = [];
            query.forEach((doc) => {
                const data = doc.data();
                friend.push({friendId: doc.id, name: data.name,images:data.images});
            });
            setFriends(friend);
          })
          .catch((error)=>{
            console.log(`データの取得に失敗しました (${error})`);
          });
    }, [uid])
    
    const [myName, setMyName] = useState(""),
        [myImages, setMyImages] = useState("");
    useEffect(() => {
        if (user !== "") {
            db.collection('user').doc(uid).get().then((doc) => {
                const data = doc.data();
                setMyName(data.name);
                setMyImages(data.images);
            }).catch((error) => {
                console.log(`データを取得できませんでした (${error})`);
            });
        }
    }, [user, uid])

    return (
        <div className={Style.friendLst}>
            <div className={Style.inner}>
                <ul>
                    <li className={Style.friendSearch}>
                        <TextBox className={'inputFriend'} label={'IDで友だち検索'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={friendId} onChange={inputFriendId} />
                        <span className="material-icons-outlined" onClick={() => { props.showSearchFriend(friendId); setShowFindFriend(true) }}>search</span>
                    </li>
                    {showFindFriend && (
                        <li className={Style.friendList}>
                            <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                            <Avatar src={props.findFriendImages ? props.findFriendImages.path : "/static/images/avatar/1.jpg"} className={Style.avatar} />
                            </Stack>
                            <p>{props.findFriendName}</p>
                            <span className="material-icons-outlined" onClick={() => { friendRequest(friendId, date, uid, myName, myImages); setSurveillance(true); }}>send</span>
                        </li>
                    )}
                    {request.length > 0 && <li className={Style.friendLstTtl}>リクエスト</li>}
                    {request.length > 0 && (
                        request.map((list) => (
                            <li key={list.friendId} className={Style.friendList} onClick={() => requestFriend(list.friendId)}>
                                <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                <Avatar src={list.requestImages ? list.requestImages.path : "/static/images/avatar/1.jpg"} className={Style.avatar} />
                                </Stack>
                                <p>{list.name}</p>
                            </li>
                        ))
                    )}
                    <li className={Style.friendLstTtl}>友だち</li>
                    {friends.length > 0 && (
                        friends.map((list) => (
                            <li key={list.friendId} onClick={() => { props.onClick(list.friendId); closeMenuBtn() }} className={Style.friendList}>
                                <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                                    <Avatar src={list.images ? list.images.path : "/static/images/avatar/1.jpg"} className={Style.avatar} />
                                </Stack>
                                <p>{list.name}</p>
                            </li>
                        ))
                    )}
                </ul>
                <div className={Style.closeBtn} onClick={closeMenuBtn}>閉じる</div>
            </div>
    </div>
    )
})

export default FriendList