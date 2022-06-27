import React, { useState, useEffect, memo } from 'react';
import Style from './styles/Request.module.scss';
import { db } from '../firebase';
import { deleteRequest,approvalRequest } from '../apis';
import { Loading } from './index';

const Request = memo((props) => {
    const { user, requestFriendId } = props;
    const uid = user.uid;
    const [requestName, setRequestName] = useState(""),
        [requestDate, setRequestDate] = useState("");
    const [myName, setMyName] = useState("");

    useEffect(() => {
        if (user !== "") {
            const uid = user.uid;
            db.collection("user").doc(uid).collection("request").doc(requestFriendId).get().then((doc)=>{
                if (doc.exists) {
                    const data = doc.data();
                    setRequestName(data.requestFriendName)
                    setRequestDate(data.requestDate)
                }
                else {
                  console.log("404");
                }
              })
              .catch( (error) => {
                  console.log(`データを取得できませんでした (${error})`);
              });
       }
    }, [user, requestFriendId])

    useEffect(() => {
        if (user !== "") {
            const uid = user.uid;
            db.collection("user").doc(uid).get().then((doc)=>{
                if (doc.exists) {
                    const data = doc.data();
                    setMyName(data.name)
                }
                else {
                  console.log("404");
                }
              })
              .catch( (error) => {
                  console.log(`データを取得できませんでした (${error})`);
              });
       }
    }, [user, requestFriendId])
    
    const [loading, setLoading] = useState(false);
    const [complete, setComplete] = useState(false);
    const [rejection, setRejection] = useState(false);
    const [consent, setConsent] = useState(false);
    const { requestFriend } = props;
    useEffect(() => {
        if (loading === true && rejection === true) {
            deleteRequest().then((response) => {
                if (response[0] === 200) {
                    setLoading(false);
                    setComplete(true);
                } else {
                    return false;
                }
            })   
        } else {
            return false;
        }
    }, [loading,rejection])

    useEffect(() => {
        if (loading === true && consent === true) {
            approvalRequest().then((response) => {
                if (response[0] === 200) {
                    setLoading(false);
                    setComplete(true);
                } else {
                    return false;
                }
            })   
        } else {
            return false;
        }
    }, [loading,consent])

    useEffect(() => {
        if (complete === true) {
            const timer = setTimeout(() => {
                setComplete(false)
                requestFriend("");
            }, 1000);
            return () => clearTimeout(timer);   
        } else {
            return false;
        }
    },[complete,requestFriend])
    
    return (
        <div className={Style.request_inner}>
            <React.Fragment>
                <h2>{requestName}</h2>
                <p>リクエスト日：{requestDate}</p>
                <div className={Style.answer_bx}>
                    {(() => {
                        if (loading === true || complete === true) {
                            return <Loading loading={loading} complete={complete} />
                        } else {
                            return <><div className={Style.left} onClick={() => { setLoading(true);setRejection(true); deleteRequest(requestFriendId, uid);}}>拒否</div>
                            <div className={Style.right} onClick={() => { setLoading(true);setConsent(true); approvalRequest(requestFriendId, requestName, uid,myName) }}>承認</div></>
                        }
                    })()}
                </div>
            </React.Fragment>
        </div>
    )
})

export default Request;