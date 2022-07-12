import React,{useState,useCallback,useEffect,memo} from 'react';
import { SideBar } from './index';
import TextBox from './UIkit/TextBox';
import { editUserData } from '../apis';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useAuthContext } from '../pages/AuthContext';
import Style from './styles/Profile.module.scss';
import { db,storage } from '../firebase';
import Resizer from "react-image-file-resizer";
import {LineShareButton,LineIcon} from "react-share";
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Profile = memo((props) => {
    const { user } = useAuthContext();
    const uid = user.uid;
    const [thumbnail, setThumbnail] = useState(null);
    const [filename, setFilename] = useState(null);
    const [images, setImages] = useState([]);
    const [name, setName] = useState(""),
        [nationality, setNationality] = useState(""),
        [bloodType, setBloodType] = useState(""),
        [passportNumber, setPassportNumber] = useState("");
    const [editBtn, setEditBtn] = useState(false);
    const inputName = useCallback((event) => { setName(event.target.value);setEditBtn(true); }, [setName]);
    const inputNationality = useCallback((event) => { setNationality(event.target.value); setEditBtn(true); }, [setNationality]);
    const inputBloodType = useCallback((event) => { setBloodType(event.target.value); setEditBtn(true); }, [setBloodType]);
    const inputPassportNumber = useCallback((event) => { setPassportNumber(event.target.value); setEditBtn(true); }, [setPassportNumber]);

    useEffect(() => {
        if (user !== "") {
           db.collection('user').doc(uid).get().then((doc)=>{
               const data = doc.data();
               setName(data.name);
               setNationality(data.nationality);
               setBloodType(data.bloodType);
               setPassportNumber(data.passportNumber);
               setImages(data.images);
          })
          .catch( (error) => {
              console.log(`データを取得できませんでした (${error})`);
          });
       }
    },[user,uid])

    const resizeFile = (file) => {
        return new Promise((resolve) => {
          Resizer.imageFileResizer(
            file,
            350,
            'auto',
            'jpeg',
            100,
            0,
            (uri) => {
              resolve(uri)
            },
            'base64'
          )
        })
          }

    const onChange = async (e) => {
        const blobImage = e.target.files[0];
        if (blobImage !== undefined) {
          if (/image.*/.exec(blobImage.type)) {
            const resizeImage = (await resizeFile(blobImage));
            setThumbnail(resizeImage);
            const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWSYZ0123456789";
            const N = 16;
            const fileName = Array.from(crypto.getRandomValues(new Uint32Array(N))).map((n) => S[n % S.length]).join('')
            setFilename(fileName);
            const uploadRef = storage.ref(`images/${uid}/`).child(fileName);
            const uploadTask = uploadRef.put(blobImage);
            uploadTask.then(() => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    const newImage = { id: fileName, path: downloadURL };
                    setImages(newImage)
                });
            })
          } else {
            console.log("データの読み込みに失敗しました。")
          }
        }
    }

    const [browserSize, setBrowserSize] = useState(false);
    function realtimeInnerWidth() {
        return window.innerWidth
    }

    useEffect(() => {
        let cancel = false;
        window.onresize = function () {
            if (cancel) return;
            if (realtimeInnerWidth() >= 751 && browserSize !== false) {
                setBrowserSize(false)
            } else if(realtimeInnerWidth() <= 750 && browserSize !== true) {
                setBrowserSize(true)
            } else {
                return false
            }
        }
        return () => { 
            cancel = true;
          }
    },[browserSize])
    
    const closeMenuBtn = () => {
        if (browserSize === false) {
            props.showProfile();
        } else {
            props.showProfile();
            props.menuToggle();
            props.classToggle();
        }
    }
    const URL = 'https://geolocation-18aa2.web.app/signup';
    const QUOTE = `友だちIDが届きました。Geolocationで検索して友だちになりましょう。${uid}`;

        return (
            <div className={Style.profilePage_bx}>
                <div className={Style.sidebar_bx}>
                    <SideBar  onCLick={() => props.setOpenProfile(false)} />
                </div>
                <div className={Style.profileEdit}>
                    <div className={Style.inner}>
                        <Stack direction="row" spacing={2} className={Style.avatar_bx}>
                            {(() => {
                                if (images !== null ||images !== "" || images !== undefined) {
                                    return <Avatar alt={images.id} src={images.path} className={Style.avatar} />
                                } else {
                                    return <Avatar alt={filename} src={thumbnail} className={Style.avatar} />
                                }
                            })()}
                            <div className={Style.Register_images_bx}>
                                <label>
                                    <input type="file" name="file" onChange={onChange} /><span className="material-icons-outlined">add</span>
                                </label>
                            </div>
                        </Stack>
                        <CopyToClipboard text={uid} onCopy={() => alert(`クリップボードに「IDをコピーしました。`)}><div className={Style.copyMyId}><p>IDコピー<span>クリック</span></p></div></CopyToClipboard>
                        <LineShareButton className={Style.copyMyId} url={URL} title={QUOTE}><p>IDをLINEで共有</p><LineIcon size={24} round /></LineShareButton>
                        <TextBox className={'inputBx'} label={'Full Name（フルネーム）'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={name} onChange={inputName}/>
                        <TextBox className={'inputBx'} label={'Nationality（国籍）'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={nationality} onChange={inputNationality} />
                        <TextBox className={'inputBx'} label={'Blood type（血液型）'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={bloodType} onChange={inputBloodType} />
                        <TextBox className={'inputBx'} label={'Passport Number（パスポート番号）'} type={"text"} InputLabelProps={{ shrink: true, }} variant={"standard"} value={passportNumber} onChange={inputPassportNumber}/>
                        {editBtn ? <div className={Style.editBtn_bx}><div className={Style.left} onClick={closeMenuBtn}>閉じる</div><div className={Style.right} onClick={() => editUserData(name, nationality, bloodType, passportNumber, uid, images)}>決定</div></div> : <div className={Style.editBtn} onClick={closeMenuBtn}>閉じる</div>}
                    </div>
                </div>
            </div>
        ) 
})
export default Profile;