import React from "react";
import {Container, Row, Col } from "reactstrap";
import Login from "../auth/Login";
import Signup from "./Signup";
import APIURL from "../helpers/environment";

class Auth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: true,
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            needPassword: false
        }
    }
    handleChange = (event) => {
        this.setState({
            [event.target.id] : event.target.value
        });  
    }
    handleSubmit =(event) => {
        event.preventDefault();
        let url = this.state.login ? `${APIURL}/user/login` : `${APIURL}/user/signup`;
        fetch(url, {
            method: "POST",
            body: JSON.stringify({
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                email: this.state.email,
                password: this.state.password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(res => {
            if(res.status === 502) {
                alert("I'm sorry that is the Incorrect Password");
            } else if (res.status === 500) {
                alert("You need to sign up");
            } else {
                return res.json()
                .then(json => this.props.tokenHandler(json.sessionToken))
            }}) 
    }
    loginToggle = (event) => {
        event.preventDefault();
        const _login = this.state.login;
        this.setState({
            login: !_login,
            firstName: "",
            lastName: "",
            // email: "",
            password: ""
        })
    }
    render() {
        let buttonTitle = this.state.login ? "Signup" : "Already a User?";
        let buttonTitle2 = this.state.login ? "Login" : "Signup & Login";
        
        let title = this.state.login ? "Login" : "Sign-up";
        let signUpFields = this.state.login ? null : (
            <React.Fragment>
                <label htmlFor="firstName">First Name:</label><br/>
                <input  onChange={this.handleChange} value={this.state.firstName}type="text" id="firstName" placeholder="first name"/><br/>
                <label htmlFor="lastName">Last Name:</label><br/>
                <input onChange={this.handleChange} value={this.state.lastName}type="text" id="lastName" placeholder="last name"/><br/> 
            </React.Fragment>
        )
        return (
            <div className={this.state.login ? "login" : "signup"}>
            <form className="cardLike" onSubmit={this.handleSubmit}>
                <h1>{title}</h1>
                {signUpFields}
                <label htmlFor="email">Email:</label><br/>
                <input placeholder="email" onChange={this.handleChange} value={this.state.email} type="email" id="email" defaultValue={this.state.email}/><br/>
                <label htmlFor="password">Password:</label><br/>
                <input placeholder="password" onChange={this.handleChange} minLength="5" required value={this.state.password}type="password" id="password" /><br/>
                
                <div className="button">
                    <button className="one" onClick={this.loginToggle}>{buttonTitle}</button>
                    <button className="two" type="submit">{buttonTitle2}</button>
                </div>
            </form>
            </div>  
        )
    }
}

export default Auth;
