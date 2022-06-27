import React from 'react';
import Logo from '../asset/logo.png';
import { Link } from 'react-router-dom';
import './styles/SignUpSignInHeader.scss';

const SignUpSignInHeader = () => {

    const url = window.location.pathname;
    return (
        <div className='signupsignin_header'>
            <div className='left'><img src={Logo} alt="logo" /></div>
            <div className='right'>
                {(() => {
                    if (url === '/signin') {
                        return <Link className='authBx' to="/signup"><p>アカウント登録</p></Link>
                    } else {
                        return <Link className='authBx' to="/signin"><p>アカウントをお持ちの方</p></Link>
                    }
                })()}
            </div>
        </div>
    )
}
export default SignUpSignInHeader;