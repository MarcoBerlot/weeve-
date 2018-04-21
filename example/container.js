import React from 'react';
import { RichUtils } from 'draft-js';
import Editor from '../src';
import { Blocks, Data } from './draft';
import request from 'superagent';
import createToolbarPlugin from 'draft-js-toolbar-plugin';
import ReactDOM from 'react-dom';
import { WithContext as ReactTags } from 'react-tag-input';
import { BrowserRouter as Router, Route } from 'react-router-dom';


export default class myRouter extends React.Component{
  render(){
    return(
    <Router>
      <div>
        <Route exact path="/editor" component={myEditor} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={SignUp} />
        <Route path="/" component={Home} />
      </div>
  </Router>
)}
}
class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
  }

  render() {
    return (
      <div>
           <div id='signinContainer'>
                <form id='form'>
                    <input className='input' type="text"
                     placeholder="Email"/>
                    <input className='input' type="password"
                     placeholder="Password"/>
                    <button id='submit'>Sign Up</button>
                </form>
           </div>
      </div>
    )
  }
}

class Home extends React.Component {
   state = {
   }
   render () {
      return (
        <div id='container'>
           <a href="login">Sign In</a>
           <a href="signup" >Sign Up</a>
        </div>
      )
   }
}
class SignUp extends React.Component {
  state = {
  }

  render () {
      return (
        <div>
             <div id='signinContainer'>
                  <form id='form'>
                      <input className='input' type="text"
                       placeholder="First Name"/>
                      <input className='input' type="text"
                       placeholder="Last Name"/>
                      <input className='input' type="text"
                       placeholder="Email"/>
                      <input className='input' type="password"
                       placeholder="Password"/>
                      <button id='submit'>Sign Up</button>
                  </form>
             </div>
        </div>
      )
   }
}
class myEditor extends React.Component {
    constructor(props) {
        super(props);

        var data = localStorage.getItem("data");

        var oldHash = localStorage.getItem("hash");
        var hash = this.hash = function(s){
            return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
        }(JSON.stringify(Data))+'';

        if(data && oldHash === hash){
            try{
                data = JSON.parse(data);
            }
            catch(err){
                data = null;
                console.error(err);
            }
        }
        else{
            data = null;
        }
        this.state = {
            data: data || Data,
            view: 'edit',
            saved: false,
            tags: [
                { id: "Credentials", text: "Credentials" },
                { id: "GCP", text: "GCP" }
             ],
            suggestions: [
                { id: 'AWS', text: 'AWS' },
                { id: 'Meeting', text: 'Meeting' },
                { id: 'Task', text: 'Task' },
                { id: 'Costa Rica', text: 'Costa Rica' },
                { id: 'Sri Lanka', text: 'Sri Lanka' },
                { id: 'Thailand', text: 'Thailand' }
             ]

        }
        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.renderLogo= this.renderLogo.bind(this);
        this.renderUser= this.renderUser.bind(this);
        this.addUsers= this.addUsers.bind(this);
    }

    save(){
        URL="http://localhost:8080"
        TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6Im1iMjU4OUBjb3JuZWxsLmVkdSIsImlhdCI6MTUyNDMzNTU0MCwiZXhwIjoxNTI0NDIxOTQwfQ.WbLvPSMk1eSmLVx4_-kB6mRTmksJdz1PsU2w-xWJ9HY"
        localStorage.setItem("data", JSON.stringify(this.state.data));
        localStorage.setItem("hash", this.hash);
        /*IMPLEMENT: GET USER ID FROM BACKEND*/
        var sendingData = {}
        sendingData["collaborators"]=[1]
        sendingData["title"]="title"
        sendingData["explicit_tags"]=this.state.tags
        sendingData["body"]=this.state.data
        console.log(sendingData)

        fetch(URL+'/post/', {
          method: 'POST',
          headers: {
            'Authorization': "bearer "+TOKEN,
            'Content-Type': 'application/json',
          },
          body: sendingData
        })
    }
    handleDelete(i) {
            const { tags } = this.state;
            this.setState({
             tags: tags.filter((tag, index) => index !== i),
            });
        }

        handleAddition(tag) {
            const { tags } = this.state;
            this.setState({tags: [...tags, ...[tag]] });
        }

        handleDrag(tag, currPos, newPos) {
            const tags = [...this.state.tags];
            const newTags = tags.slice();

            newTags.splice(currPos, 1);
            newTags.splice(newPos, 0, tag);

            // re-render
            this.setState({ tags: newTags });
        }
    upload = (data, success, failed, progress) => {
        console.log(data.formData);
        request.post('/upload')
            .accept('application/json')
            .send(data.formData)
            .on('progress', ({ percent }) => {
                progress(percent);
            })
            .end((err, res) => {
                if (err) {
                    return failed(err);
                }
                success(res.body.files, 'image');
            });
    }

    defaultData = (blockType) => {
        if (blockType === 'block-image') {
            return {
                url: '/whoa.jpg',
            }
        }
        return {};
    }

    renderLogo(){
        return <div className="row, my_text">
               <div className="col-sm-offset-10">
               <div className="avatar"> <img src='/zen.jpg' alt="Girl in a jacket"></img></div>
               </div>
               </div>
    }
    renderUser(){
        return<div className="row">
                <div className="col-sm-offset-10">
                <p>Zen Yui</p>
                <p>Data Engineer</p>
                </div>
               </div>
    }

    addUsers(){
       const { tags, suggestions } = this.state;
       return (
          <div className="row margin-top">
            <div className="col-sm-offset-10 col-sm-1">
             <div className="addUsers">
                             <ReactTags tags={tags}
                                 suggestions={suggestions}
                                 handleDelete={this.handleDelete}
                                 handleAddition={this.handleAddition}
                                 handleDrag={this.handleDrag} />
              </div>
             </div>
            </div>

       )
    }
    renderSide(){
       const { tags, suggestions } = this.state;
       return (

           <div className="sidepanel">
                           <ReactTags tags={tags}
                               suggestions={suggestions}
                               handleDelete={this.handleDelete}
                               handleAddition={this.handleAddition}
                               handleDrag={this.handleDrag} />
            </div>

       )
    }


    render() {
        const {data, view, saved} = this.state;

        return (
            <div className="flex-container">
              <div className="head">
                    <div className="logo">Genie</div>

                    <button className={"button"+(view==='json'?' active':'')} onClick={()=>this.setState({view: 'json'})}>
                        See JSON
                    </button>
                    <button className={"button"+(view==='edit'?' active':'')} onClick={()=>this.setState({view: 'edit'})}>
                        See Editor
                    </button>
                    <button className="button" onClick={::this.save}>
                        {saved ? 'Saved!' : 'Save'}
                    </button>
                    <button className="button" onClick={(v)=>this.setState({data:null})}>
                        Clear
                    </button>
                    {/*<button className="button" onClick={()=>this.setState({data: Draft.AddBlock(data, 'end', 'div', {}, true)})}>
                        Horizontal+Vertical
                    </button>
                    <button className="button" onClick={()=>this.setState({data: Draft.AddBlock(data, 'start', 'div2', {}, true)})}>Add
                        Horizontal only
                    </button>
                    <button className="button" onClick={()=>this.setState({data: Draft.AddBlock(data, 'start', 'youtube', {}, true)})}>Add
                        Youtube
                    </button>*/}
                </div>
                {this.renderSide()}
                {this.renderUser()}
                {this.renderLogo()}
                {this.addUsers()}
                <div className="container-content" style={{display: view==='json' ? 'block' : 'none'}}>
                    <pre style={{whiteSpace: 'pre-wrap', width: '750px', margin: 'auto'}}>{JSON.stringify(data, null, 3)}</pre>
                </div>
                <div className="container-content" style={{display: view!=='json' ? 'block' : 'none'}}>
                    <div className="TeXEditor-root">
                        <div className="TeXEditor-editor">
                            <Editor onChange={data=>this.setState({data})}
                                    value={data}
                                    blockTypes={Blocks}
                                    cleanupTypes="*"
                                    sidebar={0}
                                    handleDefaultData={this.defaultData}
                                    handleUpload={this.upload}
                                    toolbar={{
                                      disableItems: ['H5'],
                                      textActions: [
                                      {
                                        button: <span>Quote</span>,
                                        label: 'Quote',
                                        active: (block, editorState) => block.get('type') === 'blockquote',
                                        toggle: (block, action, editorState, setEditorState) => setEditorState(RichUtils.toggleBlockType(
                                          editorState,
                                          'blockquote'
                                        )),
                                      }]
                                    }}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
