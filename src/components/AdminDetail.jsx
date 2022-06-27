import React from 'react';
import Style from './styles/AdminDetail.module.scss';

const AdminDetail = (props) => {

    return (
        <ul className={Style.adminDetail} name="admin detail">
            <li>- あなたの情報 -</li>
            <li>氏名：{props.name}</li>
            <li>血液型：{props.bloodType}型</li>
            <li>国籍：{props.nationality}</li>
            <li>パスポート：{props.passportNumber}</li>
        </ul>
)
}

export default AdminDetail;