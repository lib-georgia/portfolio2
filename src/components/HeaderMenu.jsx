import React,{memo} from 'react';
import './styles/HeaderMenu.scss';

const HeaderMenu = memo((props) => {
    const { showProfile, myLocation, menuBtn,friendBtn,classToggle,signOut } = props;

    return (
        <div className='headerMenu_bx'>
            <ul>
                <li onClick={friendBtn}><span className='menuLst_inner' onClick={menuBtn}><p>友だち</p></span></li>
                <li onClick={showProfile}><span className='menuLst_inner' onClick={menuBtn}><p>プロフィール</p></span></li>
                <li onClick={myLocation}><span className='menuLst_inner' onClick={classToggle}><p>自分の位置</p></span></li>
                <li onClick={signOut}><span className='menuLst_inner'><p>ログアウト</p></span></li>
            </ul>
        </div>
    )
})
export default HeaderMenu;