import React, { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import { Marker, SideBar, AdminDetail,FriendLocation,Message,Profile,Request,Header,HeaderMenu,FriendList } from '../components';
import { useAuthContext } from './AuthContext';
import mapColorRight from '../mapcolor/mapColorRight.json';
import normal from '../mapcolor/normal.json'; 
import mapColorDark from '../mapcolor/mapColorDark.json';
import { auth, db, FirebaseTimestamp } from '../firebase';
import Style from './styles/Dashboard.module.scss';

const Dashboard = () => {  
  const { user } = useAuthContext();
  const [mapColor, setMapColor] = useState(mapColorRight);
  const [defaultZoom, setDefaultZoom] = useState(1);
  const defaultProps = {zoom:defaultZoom};
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [choiceFriendLat, setChoiceFriendLat] = useState("");
  const [choiceFriendLng, setChoiceFriendLng] = useState("");
  const [lastTimeLat, setLastTimeLat] = useState(null);
  const [lastTimeLng, setLastTimeLng] = useState(null);
  const [userData, setUserData] = useState("");
  const [share, setShare] = useState(false);

  const [messages, setMessages] = useState("");
  const [openMessage, setOpenMessage] = useState("");

  const timestamp = FirebaseTimestamp.now();
  const timeToString = (date) => {
    return date.getFullYear() + ('00' + (date.getMonth() + 1)).slice(-2) + ('00' + date.getDate()).slice(-2) + ('00' + date.getHours()).slice(-2) + ('00' + date.getMinutes()).slice(-2)
  }
  const nowTime = timeToString(timestamp.toDate());

  useEffect(() => {
    db.collection("user").doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        setUserData(doc.data());
      }
      else {
        console.log("404");
      }
    }).catch((error) => {
      console.log(`データを取得できませんでした (${error})`);
    });
    db.collection("user").doc(user.uid).get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setLastTimeLat(data.lat);
        setLastTimeLng(data.lng);
      }
      else {
        console.log("404");
      }
    }).catch((error) => {
      console.log(`データを取得できませんでした (${error})`);
    });
  }, [user])

  useEffect(() => {
    if (share === true && ((lat !== null && lng !== null) || (lat !== lastTimeLat && lng !== lastTimeLng))) {
      navigator.geolocation.watchPosition(position => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        db.collection('user').doc(user.uid).set({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }, { merge: true }).then(() => {
          console.log('map register')
        }).catch(() => {
          console.log('none...')
        })
      }, () => {
        alert('現在地を取得できません。')
      }, {
        enableHighAccuracy: true,
        maximumAge: 1000
      });
    } else {
      return false;
    }
  },[lat, lng, lastTimeLat, lastTimeLng, user,share])

  const tokyo = {lat:Number(35.4122),lng:Number(139.4130)}
  const [centerPosition, setCenterPosition] = useState(tokyo)
  const [adminPosition, setAdminPosition] = useState(true);
  const [choiceFriendPosition, setChoiceFriendPosition] = useState(false);
  useEffect(() => {
    if (adminPosition === true && choiceFriendPosition === false) {
      if (!navigator.geolocation) {
        alert('Geolocationは、あなたのブラウザをサポートしていません。')
      } else {
        navigator.geolocation.watchPosition(position => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        }, () => {
          alert('現在地を取得できません')
        }, {
          enableHighAccuracy: true,
          maximumAge: 1000
        });
      }
    } else {
      setCenterPosition({ lat: Number(choiceFriendLat), lng: Number(choiceFriendLng) })
    }
  }, [lat, lng, choiceFriendLat, choiceFriendLng, adminPosition, choiceFriendPosition])

  const [detailAccount, setDetailAccount] = useState(false);
  function handleMarkerClick() {
    if (detailAccount === false) {
      return setDetailAccount(true);
    } else {
      return setDetailAccount(false);
    }
  }

  const signOut = () => {
    auth.signOut()
    .then(() => {
        window.location.href="/signin"
    })
};
  
  const [friendsId, setFriendsId] = useState("");
  const [friendsLocation, setFriendsLocation] = useState("");

useEffect(() => {
  db.collection("user").doc(user.uid).collection('friend').get().then((query) => {
    const id = [];
    query.forEach((doc) => {
      id.push(doc.id);
    });
    setFriendsId(id);
  })
  .catch((error)=>{
    console.log(`データの取得に失敗しました (${error})`);
  });
},[user])

  useEffect(() => {
    const NumberOfTimes = friendsId.length;
    if (friendsId.length > 0) {
      let location = [];
       for (let i = 0; i < NumberOfTimes; i++) {
        db.collection("user").doc(friendsId[i]).onSnapshot(docSnapshot => {
          const data = docSnapshot.data();
          location.push(data)
        }, err => {
          console.log(`Encountered error: ${err}`);
        });
      }
      setTimeout(function(){
        setFriendsLocation(location)
    }, 800)
    } else {
      return false
    } 
  }, [friendsId])

  const [currentKey, setCurrentKey] = useState(-1)
  const changeBalloon = (key) => {
    const keyNumber = Number(key)
    if (currentKey === keyNumber) {
      setCurrentKey(-1)
    } else {
      setCurrentKey(keyNumber)
    }
  }

  const [active, setActive] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const showProfile = () => {
    if (openProfile === true) {
      setOpenProfile(false);
      setActive(false);
    } else {
      setOpenProfile(true);
    }
  }

  const myLocation = () => {
    if (lat !== null || lng !== null) {
      setChoiceFriendPosition(false);
      setAdminPosition(true);
      setCenterPosition({ lat: Number(lat), lng: Number(lng) })
    } else {
      if (!navigator.geolocation) {
        alert('Geolocationは、あなたのブラウザをサポートしていません。')
      } else {
        navigator.geolocation.watchPosition(position => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setCenterPosition({lat:Number(position.coords.latitude),lng:Number(position.coords.longitude)})
          setDefaultZoom(15)
        }, () => {
          alert('現在地を取得できません。')
        }, {
          enableHighAccuracy: true,
          maximumAge: 1000
        });
      }
    }
  };

  const [choiceFriendId, setChoiceFriendId] = useState("");
  useEffect(() => {
    const uid = user.uid;
    if (messages !== "") {
      db.collection("user").doc(uid).collection("friend").doc(choiceFriendId).get().then((doc)=>{
        if (doc.exists) {
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
  }, [user, messages, choiceFriendId])
  
  useEffect(() => {
      if (user !== "" && choiceFriendId !== "") {
          const uid = user.uid;
          db.collection("user").doc(uid).collection("friend").doc(choiceFriendId).collection('message').orderBy("sendNumber", "asc").limit(20).onSnapshot((snapshot) => {
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

  const [choiceMapMode, setChoiceMapMode] = useState(false);
  const closeMessage = () => {
    if (openMessage === true) {
      setOpenMessage(false); setChoiceFriendId(""); setMessages("");
    } else {
      return false;
    }
  }

  const [openSearchFriend, setSearchFriend] = useState(false);
  const [findFriendName, setFindFriendName] = useState("");
  const showSearchFriend = (friendId) => {
    if (openSearchFriend === true) {
      setSearchFriend(false)
    } else {
      db.collection("user").doc(friendId).get().then((doc) => {
        const data = doc.data();
        setFindFriendName(data.name);
        setSearchFriend(true)
      })
    }
  }

  const [openRequestFriend, setOpenRequestFriend] = useState(false);
  const [requestFriendId, setRequestFriendId] = useState("");
  const requestFriend = (friendId) => {
    if (openRequestFriend === true) {
      setOpenRequestFriend(false)
    } else {
      setOpenRequestFriend(true)
      setRequestFriendId(friendId)
    }
  }

  const choiceFriendLocation = (friendId) => {
    if (friendId !== "") {
      db.collection('user').doc(friendId).get().then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setChoiceFriendPosition(true)
          setAdminPosition(false)
          setCenterPosition({ lat: Number(data.lat), lng: Number(data.lng) })
          setChoiceFriendLat(Number(data.lat));
          setChoiceFriendLng(Number(data.lng));
          setDefaultZoom(15)
        }
        else {
          console.log("404");
        }
      })
      .catch( (error) => {
          console.log(`データを取得できませんでした (${error})`);
      });
    }
  }

  const [showMenu, setShowMenu] = useState(false);
  const menuBtn = () => {
    if (showMenu === true) {
      setShowMenu(false);
    } else {
      setShowMenu(true);
    }
  }

  const classToggle = () => {
      if (active === true) {
          setActive(false)
          menuBtn()
      } else {
          setActive(true)
          menuBtn()
      }
  }
  const menuToggle = () => {
    setActive(!active)
}

  const [showFriend, setShowFriend] = useState(false);
  const friendBtn = () => {
    if (showFriend === true) {
      setShowFriend(false)
      setActive(false);
    } else {
      setShowFriend(true)
    }
  }

  if (!user) {
    window.location.href="/signin";
  } else {

    return (
      <div className={Style.App}>
        <Header menuBtn={menuBtn} classToggle={classToggle} active={active} />
        <div className={Style.ovf}>
          <div className={Style.map_bx}>
            <SideBar
              signOut={signOut}
              showProfile={showProfile}
              showSearchFriend={showSearchFriend}
              findFriendName={findFriendName}
              name={userData.name}
              uid={userData.uid}
              requestFriend={requestFriend}
              onClick={choiceFriendLocation}
              myLocation={myLocation}
            />
            <div style={{ height: '100vh', width: '100%' }}>
              <GoogleMapReact
                bootstrapURLKeys={{ key: "AIzaSyD0bgys1av9hSd8qEHaxJ7bQvLA5Sh_6-0" }}
                center={centerPosition}
                defaultZoom={1}
                zoom={defaultProps.zoom}
                options={{ styles: mapColor }}
                onChildClick={(key) => changeBalloon(key)}
              >
                <Marker className={Style.adminPosition} lat={lat} lng={lng} name="あなた" color="#e96650" onMarkerClick={handleMarkerClick} />
                {friendsLocation.length > 0 && (
                  friendsLocation.map((list, index) => (
                    <FriendLocation setChoiceFriendId={setChoiceFriendId} key={index} uid={list.uid} lastShareTime={list.lastShareTime} nowTime={nowTime} lat={list.lat} lng={list.lng} name={list.name} bloodType={list.bloodType} nationality={list.nationality} passportNumber={list.passportNumber} currentKey={currentKey} index={index} />                   
                  )))}
                {detailAccount && <AdminDetail name={userData.name} bloodType={userData.bloodType} nationality={userData.nationality} passportNumber={userData.passportNumber} lat={lat} lng={lng} />}
              </GoogleMapReact>
              <div className={Style.share_bx}>
              {(() => {
                if (share === false) {
                  return <div className={Style.startShare} onClick={() => setShare(true)}>共有する</div>
                } else {
                  return <div className={Style.stopShare} onClick={() => setShare(false)}>共有しない</div>
                }
                })()}
                {choiceMapMode ?
                  <ul className={Style.choiceColorMode}>
                    <li onClick={() => { setMapColor(normal); setChoiceMapMode(false) }}>ノーマル</li>
                    <li onClick={() => { setMapColor(mapColorDark); setChoiceMapMode(false) }}>ダーク</li>
                    <li onClick={() => { setMapColor(mapColorRight); setChoiceMapMode(false) }}>ライト</li>
                  </ul>
                   :
                   <span className={Style.toggle_choiceMapMode}><span onClick={() => setChoiceMapMode(true)} className="material-icons-outlined">public</span></span>
                }
              </div>
            </div>
          </div>
        </div>
        {openMessage && (
          <div className={Style.message_bx}>
            <Message choiceFriendId={choiceFriendId} userData={userData} setChoiceFriendId={setChoiceFriendId} user={user} setOpenMessage={setOpenMessage} closeMessage={closeMessage} />
          </div>
        )}
        {openProfile && (
          <div className={Style.message_bx}>
            <Profile showProfile={showProfile} classToggle={classToggle} menuToggle={menuToggle} />
          </div>
        )}
        {openRequestFriend && (
          <div className={Style.message_bx}>
            <Request user={user} requestFriendId={requestFriendId} requestFriend={requestFriend} />
          </div>
        )}
        {showMenu && (
          <HeaderMenu showProfile={showProfile} myLocation={myLocation} menuBtn={menuBtn} friendBtn={friendBtn} classToggle={classToggle} signOut={signOut} choiceFriendId={choiceFriendId} />
        )}
        {showFriend && (
          <FriendList friendBtn={friendBtn} requestFriend={requestFriend} menuBtn={menuBtn} menuToggle={menuToggle} classToggle={classToggle} onClick={choiceFriendLocation} />
        )}
      </div>
  )
  }
}

export default Dashboard;
