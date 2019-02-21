

import React, {Component} from "react";
import {Button, Form, FormGroup, Label, Input, Modal, ModalHeader, ModalBody} from "reactstrap";
import { Container, Row, Col } from "reactstrap";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

import Randomizer from "./Randomizer";
import UserWorkouts from "./UserWorkouts";
import UpdateModal from "./UpdateModal";


class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            exercises: [],
            generatedWorkout: [],
            userWorkouts: [],
            selectedWorkout: {workouts:[]},
            updatedPressed: true,
            clickUpdate: false,
            hasGenerated: false,
            numberOfExercises: "",
            time: "",
            comments: ""
        }
    }
    componentDidMount() {
        fetch("http://localhost:3000/admin/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            // console.log(res.json());
            return res.json()
        })
        .then(workout => this.setState({exercises: workout}, () => console.log(this.state.exercises)));

        this.fetchUserWorkouts();
    }
    fetchUserWorkouts = () => {
        fetch("http://localhost:3000/log/getall", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": this.props.token
            }
        }).then(res => {
            return res.json()
        }).then(workouts => this.setState({userWorkouts: workouts}))
    }

    

    setUpdatedWorkout = (event) => {
        event.preventDefault();
        this.setState({generatedWorkout: []})
        {this.state.updatedPressed ? this.setState({updatedPressed: false}) : this.setState({updatedPressed: true})}
        
    }
    incomingModal =(event) => {
        event.preventDefault();
        fetch(`http://localhost:3000/log/get/${event.target.id}`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "Authorization": this.props.token
            }
        }).then(res => {
            return res.json();
        }).then(workout => this.setState({selectedWorkout: workout}));
        this.closeModal();
    }
    closeModal = () => {
        {this.state.clickUpdate ? this.setState({clickUpdate: false}) : this.setState({clickUpdate: true})}
    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })

    }
    generateWorkout = (event) => {
        this.setState({
            generatedWorkout: []
        }, () => {
            let array = [];
            let workout = this.state.generatedWorkout;
            let exercises = this.state.exercises;
            let number = this.state.numberOfExercises;
            let randomWorkoutGenerator = (arr) => {
                while(arr.length < number) {
                    let newNumber = Math.floor(Math.random() * exercises.length);
                    if(arr.indexOf(newNumber) < 0) {
                        arr.push(newNumber);
                    }
                    randomWorkoutGenerator(arr);
                }
                console.log(arr);
                
            }
            randomWorkoutGenerator(array);
            for (let i = 0; i < array.length; i++) {
                let index = array[i];
                // console.log(exercises[index]);
                workout.push(exercises[index]);
            }
            this.setState({
                generatedWorkout: workout
            }) 
        })
    }
    deleteWorkout = (event) => {
        console.log(event.target.id);
        fetch(`http://localhost:3000/log/delete/${event.target.id}`, {
            method: "DELETE",
            body: JSON.stringify({log: {id: event.target.id}}),
            headers: new Headers({
                "Content-Type": "application/json",
                "Authorization": this.props.token
            })
        }).then((res) => this.fetchUserWorkouts());
    }
    handleSubmit =(event) => {
        event.preventDefault();
        let workouts = this.state.generatedWorkout.map(el => {
            return el.id;
        });
        // console.log(workouts);
        fetch("http://localhost:3000/log/save", {
            method: "POST",
            body: JSON.stringify({
                workouts: workouts,
                time: parseInt(this.state.time),
                comments: this.state.comments
            }),
            headers: new Headers ({
                "Content-Type": "application/json",
                "Authorization": this.props.token
            })
        })
        .then((res) => res.json())
        .then((workouts) => this.fetchUserWorkouts())
        .then(this.setState({
            time:"",
            comments:"",
            updatedPressed: false}))
    }
    updateWorkout = (event, workout) => {
        event.preventDefault();
        // console.log(workout.id)
        fetch(`http://localhost:3000/log/update/${workout.id}`, {
            method: "PUT",
            body: JSON.stringify({
                time: parseInt(this.state.time),
                comments: this.state.comments
            }),
            headers: new Headers ({
                "Content-Type": "application/json",
                "Authorization": this.props.token
            })
        }).then(res => res.json())
        .then(workouts => this.fetchUserWorkouts())
        .then(this.setState({
            clickUpdate: false,
            time:"",
            comments:""
        }))
    }
    render() {
        const closeBtn = <button className="close" onClick={this.setUpdatedWorkout}>&times;</button>

        return (
            <div className="modalForm">
            <Container fluid className="formContainer">
                <Row>
                    <Col md="12" lg="4">
                        <Button className="generateButton" onClick={this.setUpdatedWorkout}>Generate a New Workout</Button>
                    </Col>
                    <Col md="12" lg="8">
                        <UserWorkouts delete={this.deleteWorkout} userWorkouts={this.state.userWorkouts} incomingModal={this.incomingModal} exercises={this.state.exercises}/>
                    </Col>
                </Row>
            </Container>
            {this.state.clickUpdate ? <UpdateModal incomingModal={this.incomingModal} close={this.closeModal} exercises={this.state.exercises} updateWorkout={this.updateWorkout} selectedWorkout={this.state.selectedWorkout} handleChange={this.handleChange}/> : null}
            {this.state.updatedPressed ? 
            <Modal isOpen={true}>
            <Container>
                <ModalHeader toggle={this.setUpdatedWorkout} close={closeBtn}>Random Workout</ModalHeader>
                <br/>
                        <Form onSubmit={this.handleSubmit} >
                        <Row>
                            <Col md="8">
                                <Label for="number">Choose how many exercises you would like to do today!</Label>
                            </Col>
                            <Col md="3">
                                <Input type="select" name="numberOfExercises" id="number" onChange={this.handleChange} placeholder="number">
                                    <option></option>
                                    <option>2</option>
                                    <option>3</option>
                                    <option>4</option>
                                    <option>5</option>
                                    <option>6</option>
                                    <option>7</option>
                                    <option>8</option>
                                    <option>9</option>
                                    <option>10</option>
                                </Input>
                            </Col>
                        </Row>
                        <br/>
                        {this.state.generatedWorkout.length > 0 ? <Randomizer generatedWorkouts={this.state.generatedWorkout}/>: null}
                        <br />  
                        <div className="buttons">
                            <Button onClick={this.generateWorkout}>Generate</Button>
                            <Button type="submit" color="warning">Save Workout</Button>
                        </div>
                    </Form>
            </Container>
            {/* <Button onClick={this.setUpdatedWorkout} color="danger">Close</Button> */}
            </Modal> : <div></div>}
            </div>
            

        )

    }
}
export default User;



