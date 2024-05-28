import './admin.css';

function Admin(){
    
    return(
        <>
    
            <header id="containerHeader">

                <div id="flexContainerLeft">
                    <h1 id='logo'>LOADING..</h1>
                </div>

                <div id="flexContainerRight">
                    <p id='userName'>Admin</p>
                    <img alt="Admin" id='profilePicture'/>
                </div>

            </header>

        
            <section id='partent-margin'>

                <section id='containerSectionButton'>
                    <button id='createNewButton'>Create new</button>
                </section>
        
                <section id='containerSectionName'>
                    <div id='start'>
                        <div id='one'><p>Id</p></div>
                        <div id='two'><p>Name</p></div>
                        <div id='three'><p>Number of questions</p></div>
                    </div>
                    <div id='end'>
                        <p>Edit</p>
                    </div>
                </section>
                
                <section id='containerSectionName'>
                    <div id='start'>
                        <div id='one'><p>1</p></div>
                        <div id='two'><p>Peer Gynt</p></div>
                        <div id='three'><p>6</p></div>
                    </div>
                    <div id='end'>
                        <button id='play'>Play</button>
                        <button id='edit'>Edit</button>
                        <button id='remove'>Remove</button>
                    </div>
                </section>

                <section id='containerSectionName'>
                    <div id='start'>
                        <div id='one'><p>2</p></div>
                        <div id='two'><p>Peer Gynt og den forsvunende diamnt</p></div>
                        <div id='three'><p>6</p></div>
                    </div>
                    <div id='end'>
                        <button id='play'>Play</button>
                        <button id='edit'>Edit</button>
                        <button id='remove'>Remove</button>
                    </div>
                </section>

            </section>
        </>
    );

}

export default Admin;