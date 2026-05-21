import Dashboard from "./Dashboard"
import Transaction from "./Transaction"
import Layout from "./Layout"
import Login from "./Login"
import Signup from "./Signup"


function Home() {
    return (
        <div>
            <Signup />
            <Login />
            {/* <Layout />
            <Dashboard /> */}
            {/* <Transaction /> */}
        </div>
    )
}

export default Home