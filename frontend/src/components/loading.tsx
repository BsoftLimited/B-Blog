import "../assets/styles/loading.css";

const Loading = () =>{
    return (
        <div className="bg-light" style={{ position:"fixed", top: "0", left: "0",  backgroundColor: "white", width: "100%", height: "100%", zIndex:"1000"}}>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)"}}>
                <label className="loader">
                    <label className="loader-inner"></label>
                </label>
            </div>
        </div>
    );
}

export default Loading;