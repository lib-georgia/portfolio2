import { auth } from "../firebase"
import { getAuth, deleteUser } from "firebase/auth";

const isValidEmailFormat = (email) => {
    const regex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
    return regex.test(email)
}
const isValidRequiredInput = (...args) => {
    let validator = true;
    for (let i=0; i < args.length; i=(i+1)|0) {
        if (args[i] === "") {
            validator = false;
        }
    }
    return validator
};
const headers = new Headers();
headers.set('Content-type', 'application/json');

export const signUp = (name, email,password,confirmPassword) => {
    return async () => {
        if (name === "" || email === "" || password === "" || confirmPassword === "") {
            alert("必須項目が未入力です。")
            return false
        }
        if (password !== confirmPassword) {
            alert("パスワードが一致しません。")
            return false
        }
        if (password.length < 6) {
            alert('パスワードは6文字以上で入力してください。')
            return false
        }
        if(!isValidEmailFormat(email)) {
            alert('メールアドレスの形式が不正です。もう1度お試しください。')
            return false
        }
        return auth.createUserWithEmailAndPassword(email, password).then(async(result) => {
            const user = result.user;
            if (user) {
                const uid = user.uid;
                const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/signUp/v1/signUp", {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        uid: uid
                    })
                })
                const signUpResponse = await response.json()
                if (signUpResponse.statusCode === 200) {
                    alert('ご登録ありがとうございます。')
                    window.location.href="/";
                } else {
                    const user = auth.currentUser;
                    const uid = user.uid;
                    const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/signUp/v1/signUp", {
                            method: 'DELETE',
                            headers: headers,
                            body: JSON.stringify({
                                uid: uid
                            })
                    })
                    deleteUser(user);
                    alert('登録が失敗しました。')
                    const signUpResponse = await response.json()
                    return JSON.parse(signUpResponse.body)
                }
            }
        }).catch(async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user.uid;
            const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/signUp/v1/signUp", {
                    method: 'DELETE',
                    headers: headers,
                    body: JSON.stringify({
                        uid: uid
                    })
            })
            alert('登録が失敗しました。')
            deleteUser(user);
            const signUpResponse = await response.json()
            return JSON.parse(signUpResponse.body)
        });
    }
}

export const signIn = (email,password) => {
    return async () => {
        if (!isValidRequiredInput(email, password)) {
            alert('メールアドレスかパスワードが未入力です。')
            return false
        }
        if (!isValidEmailFormat(email)) {
            alert('メールアドレスの形式が不正です。')
            return false
        }
        auth.signInWithEmailAndPassword(email, password)
        .then(result => {
            const user = result.user
            if (user) {
                window.location.href="/";
            }
        })
    }
}

export const editUserData = async (name, nationality, bloodType, passportNumber, uid, images) => {
    if (nationality === undefined) {
        nationality = ""
    }
    if (bloodType === undefined) {
        bloodType = ""
    }
    if (passportNumber === undefined) {
        passportNumber = ""
    }
    const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/editUserData/v1/editUserData", {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            name: name,
            nationality: nationality,
            bloodType: bloodType,
            passportNumber: passportNumber,
            uid: uid,
            images: images
        })
    })
    const editUserDataResponse = await response.json()
    if(editUserDataResponse.statusCode === 200) {
        alert('編集完了しました。')
        return JSON.parse(editUserDataResponse.body)
    } else {
        alert('編集が失敗しました。')
    }
}

export const sendMessage = async (uid, newMessage, choiceFriendId, sendNumber, time, date) => {
    if (newMessage === "" || choiceFriendId === "") {
        return false
    } else {
        const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/sendMessage/v1/sendMessage", {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                uid:uid,
                message: newMessage,
                friendId: choiceFriendId,
                time: time,
                date: date,
                sendNumber:Number(sendNumber)
            })
        })
        const sendMessage = await response.json()
        return JSON.parse(sendMessage.body)
    }
}

export const friendRequest = async (friendId, date,uid,myName,myImages) => {
    const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/friendRequest/v1/friendRequest", {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            uid:uid,
            friendId: friendId,
            name: myName,
            images:myImages,
            date:date
        })
    })
    const friendRequest = await response.json()
    return JSON.parse(friendRequest.body)
}

export const deleteRequest = async (requestFriendId, uid) => {
    const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/deleteRequest/v1/deleteRequest", {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({
            requestFriendId: requestFriendId,
            uid:uid
        })
    })
    const deleteRejectionRequest = await response.json()
    if (deleteRejectionRequest.body === '"completed! deleteRequest"') {
        alert('拒否しました。')
        window.location.reload()
    }
    return JSON.parse(deleteRejectionRequest.body)
}

export const approvalRequest = async (uid, requestFriendId, requestName, requestImages, myName, myImages) => {
    const response = await fetch("https://us-central1-geolocation-18aa2.cloudfunctions.net/approvalRequest/v1/approvalRequest", {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            requestFriendId: requestFriendId,
            requestName: requestName,
            requestImages:requestImages,
            uid:uid,
            myName: myName,
            myImages:myImages
        })
    })
    const friendRequest = await response.json()
    if (friendRequest.body === '"completed approvalRequest"') {
        alert('承認しました。')
        window.location.reload()
    }
    return JSON.parse(friendRequest.body)
}