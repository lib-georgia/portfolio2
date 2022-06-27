import React,{memo} from 'react';

const Loading = memo((props) => {
    const { loading, complete } = props;

    return (
        <>
            {(() => {
                if (loading === true) {
                    return <span className='loader'>Loading...</span>
                } else if (complete === true) {
                    return <span className='completed'><span className="material-icons-outlined">done</span></span>
                } else {
                    return <></>
                }
            })()}
        </>
    )
})

export default Loading;