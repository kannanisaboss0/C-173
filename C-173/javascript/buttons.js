//----------------------------------------------------------------------C-168----------------------------------------------------------------//
//----------------------------------------------------------------Automobiles Galore----------------------------------------------------------------//
//--------------------------------------------------------------------buttons.js-----------------------------------------------------------------//


//Registering a component to create html buttons 
AFRAME.registerComponent("button-renderer",{

    //Schema
    schema:{ 
        user_data_vals:{type:"array",default:[]},
        filtered_document:{type:"array",default:[]},
        user_email:{type:"string",default:""}
    },

    //Calling an async init function
    init: async function(){

        //Calling a function to initiate login and sign up procedures
        this.initiateLoginAndSignUpPrompt()

        //Delcaring an new variable "automobiles" and assigning it to a function ~~(iv)
        var automobiles;
        automobiles=await this.getAutomobiles();
      
        //Declaring a new variable "users" and assigning it to a function ~~(v)
        var users;
        users= await this.getUsers()
  
        //Sourcing the rate button and setting its text ~~(vi)
        button_purchase=document.getElementById("purchase_btn")
        button_purchase.innerHTML="PURSCHASE"

        //Sourcing the rate button and setting its text ~~(vii)
        button_info=document.getElementById("info_btn")
        button_info.innerHTML="INFO"

        //Sourcing the rate button and setting its text ~~(viii)
        button_rate=document.getElementById("rate_btn")
        button_rate.innerHTML="RATE"

        //Sourcing the orders button ~~(ix)
        button_view_orders=document.getElementById("view_orders_btn")

        //Adding a "click" event listener for the orders button at (ix)
        button_view_orders.addEventListener("click",()=>{

            //Calling a function to display the orders list in the form of a swal
            this.manageAndDisplayOrdersList(this.data.user_email)
        })
    },

    //Defining a function to avail all automobile lists from the database
    getAutomobiles: async function(){

        //Collecting data from firestore
        return await firebase.firestore().
        collection("automobiles").get().
        then(snapshot=>{ return snapshot.docs.map(doc=> doc.data())})
    },

    //Defining an async function to avail all user lists from the database
    getUsers: async function(){

        //Collecitng data from firestore
        return await firebase.firestore().
        collection("users").get().
        then(snapshot=>{ return snapshot.docs.map(doc=> doc.data())})
    },

    //Defining an async function to initiate login and sign-up procedures
    initiateLoginAndSignUpPrompt:  async  function(){

        //Displaying a sweet alert modal for the main page
        swal({

            //Text attribute
            text:"Welcome to AutoDown \n The World's Premier Online Car Showcase \n Kindly login, if you already possess an account. If not, a brand new account is just a few clicks away!",

            //Attributes to ensure the alert box does not close on clicking on escape or clicking outside it
            closeOnEsc:false,
            closeOnClickOutside:false,

            //Buttons attribute
            buttons:{
                log_in:{
                    text:"Login",
                    value:"login"
                },
                sign_in:{
                    text:"Sign Up",
                    value:"sign-up"
                }
            }
            })

            //Using the then method in which a function is called to assess the user's choice
            .then((action)=>{

                //Assessing the user's choice, and accoridngly performing required actions

                ////Case-1 -The user wants to login
                if(action==="login"){

                    //Displaying a sweet alert modal to display the first step of login
                    swal({

                        //Title and text attributes
                        title:"Step 1",
                        text:"Please enter your email id",

                        //Attributes to ensure the alert box does not close on clicking on escape or clicking outside it
                        closeOnClickOutside:false,
                        closeOnEsc:false,

                        //Content attribute for the input
                        content:{
                            element:"input",
                            attributes:{
                                placeholder:"Please enter your email id",
                            }   
                        },  
                    })

                    //Using the then method in which a function is called to proceed to the final stage of login
                    .then((input_value_email)=>{

                        //Trimming off whitespace from the user's input
                        input_value_email=input_value_email.trim()

                        //Calling a custom defined function to assess the validity of given parameters, here the email inputted

                        /*
                        Ternary operator used
                        The email is valid->True 
                        The email is invalid->False
                        */

                        this.assessParameters(input_value_email,1)===true?

                        //Displaying a sweet alert modal to display the final step of login
                        swal({

                            //Title and text attributes
                            title:"Step 2",
                            text:"Please enter your password",

                            //Attributes to ensure the alert box does not close on clicking on escape or clicking outside it
                            closeOnClickOutside:false,
                            closeOnEsc:false,

                            //Content attribute for the input
                            content:{
                                element:"input",
                                attributes:{
                                    placeholder:"Password",
                                    value:"",
                                    type:"password"
                                }
                            },   
                        })
                        
                        //Using the async then method in which a function is called to assess all the credentials inputted with reference to information from the database
                        .then( async (input_value_pass)=>{

                            //Calling a custom defined function to assess the validity of given parameters, here the password inputted

                            /*
                            Ternary operator used
                            The password is invalid->True 
                            The password is valid->False
                            */

                            this.assessParameters(input_value_pass,0)!==true?

                            //Calling custom defined function that displays a modifiable error message
                            this.errorPromptAndReturnToHome("At least enter something rather than nothing!")
                            :
                            
                           //Sourcing the password value from the database, using the email stipulated
                           await firebase.firestore().collection("users").where("email","==",input_value_email).get().then(snapshot=>{

                                //Verifying if there are valid results for the email

                                ////Case-1 -The reponse is empty
                                if(snapshot.empty){

                                    //Calling custom defined function that displays a modifiable error message
                                    this.errorPromptAndReturnToHome("The email does not exist")
                                }
                                snapshot.forEach(doc => 
                                this.data.filtered_document.push(doc.data())
                                         )
                                            })

                                //Verifying whether the sourced password matches the inputted one   
                                
                                ////Case-1 -The sourced password matches the inputted one 
                                if(this.data.filtered_document[0]["password"]===input_value_pass){

                                    //Displaying a sweet alert modal with the user's username to affirm success
                                    swal({

                                        //Icon and text attributes
                                        icon:"success",
                                        text:`Welcome ${this.data.filtered_document[0]["user_name"]}`
                                    })

                                    //Assigning the verified email to a component attribute
                                    this.data.user_email=this.data.filtered_document[0]["email"]  
                                    
                                    //Sourcing the email div tag and setting the name attribute of it to the user's email id
                                    email_div=document.getElementById("div_eml")
                                    email_div.setAttribute("name",this.data.user_email)

                                }

                                ////Case-2 ~Else case
                                else{
                                    this.errorPromptAndReturnToHome("The password is incorrect")
                                }           
                        })
                        :

                        //Calling custom defined function that displays a modifiable error message
                        this.errorPromptAndReturnToHome("Either your email is blank or it does not contain the suffix '@gmail.com'")    
                    })
                }


                ////Case-1 -The user wants to sign up
                else if(action==="sign-up"){

                    //Displaying a sweet alert modal to display the first step of sign up
                    swal({

                        //Title and text attributes
                        title:"Step 1",
                        text:"By joining AutoDown, you are opening the doors to the ultimate supercar experience. View some of the most exquisite cars on the lot using VR! \n We wholeheartedly welcome you, and we hope you enjoy a seamless experience \n \n What would you like to be called?",

                        //Attributes to ensure the alert box does not close on clicking on escape or clicking outside it
                        closeOnClickOutside:false,
                        closeOnEsc:false,

                        //Content attributefor the input
                        content:{
                            element:"input",
                            attributes:{
                                placeholder:"Username (Eg. Pruis_lover_2282.-> Disgusting, but fine)",
                            }
                        },  
                    })

                    //Using a then method in which a function is called to proceed with the second step of sign up
                    .then((input_value)=>{

                        //Pushing the inputted username into a attribute list
                        this.data.user_data_vals.push(input_value)

                        //Calling a custom defined function to assess the validity of given parameters, here the username inputted

                        /*
                        Ternary operator used
                        The password is invalid->True 
                        The password is valid->False
                        */

                        this.assessParameters(input_value,0)===true?

                        //Displaying a sweet alert modal to display the second step of sign up
                        swal({

                            //Title and text attributes
                            title:"Step 2",
                            text:"What would your email id be?",

                            //Attributes to ensure the alert box does not close on clicking on escape or clicking outside it
                            closeOnClickOutside:false,
                            closeOnEsc:false,

                            //Content attribute for the input
                            content:{
                                element:"input",
                                attributes:{
                                placeholder:"Email Id (Eg. Prius_addict@gmail.com -> Wha-Fine...)",
                            }
                        },     
                        })
                        
                        //Using a then method in which a function is called to proceed with the third step of sign up
                        .then((input_value)=>{
                        
                            //Trimming off the whitespaces of the user's input
                            input_value=input_value.trim()


                            //Pushing the inputted email into a attribute list
                            this.data.user_data_vals.push(input_value)

                            //Calling a custom defined function to assess the validity of given parameters, here the email inputted

                            /*
                            Ternary operator used
                            The password is invalid->True 
                            The password is valid->False
                            */

                            this.assessParameters(input_value,1)===true?

                            //Displaying a sweet alert modal to display the third step of sign up
                            swal({

                                //Title and text attributes
                                title:"Step 3",
                                text:"What would be the cryptic code to your account?",

                                //Attributes to ensure the alert box does not close on clicking on escape or clicking outside it
                                closeOnClickOutside:false,
                                closeOnEsc:false,

                                //Content attribute for the input
                                content:{
                                    element:"input",
                                    attributes:{
                                    placeholder:"Password (Eg. Prius for lyf -> This is unbearable)",
                                    type:"password"
                                }     
                        },     
                        })
                        
                        //Using a then method in which a function is called to proceed with the fourth step of sign up
                        .then((input_value)=>{

                            //Trimming off the whitespaces of the user's input
                            input_value=input_value.trim()

                            //Pushing the inputted password into a attribute list
                            this.data.user_data_vals.push(input_value)

                            //Calling a custom defined function to assess the validity of given parameters, here the password inputted

                            /*
                            Ternary operator used
                            The password is invalid->True 
                            The password is valid->False
                            */

                            this.assessParameters(input_value,0)===true?
                
                                //Displaying a sweet alert modal to display the fourth step of sign up
                                swal({

                                    //Title and text attributes
                                    title:"Step 4",
                                    text:"Where do live so we could deliver your *expensive* orders",

                                    //Attributes to ensure the alert box does not close on clicking on escape or clicking outside it
                                    closeOnClickOutside:false,
                                    closeOnEsc:false,

                                    //Content attribute for the input
                                    content:{
                                        element:"input",
                                        attributes:{
                                        placeholder:"Address (Eg. Prius Paradise -> That does not exist, anorak!)",
                                    }
                        },
                            })
                            
                            //Using a then method in which a function is called to add the credntials into a new user document of collection "users"
                            .then((input_value)=>{

                                //Pushing the inputted address into a attribute list
                                this.data.user_data_vals.push(input_value)

                                //Calling a custom defined function to assess the validity of given parameters, here the password inputted

                                /*
                                Ternary operator used
                                The password is invalid->True 
                                The password is valid->False
                                */

                                this.assessParameters(input_value,0)===true?

                                //Adding all the credentials to a new document of the collection "users" 
                                firebase.firestore().collection("users").add({
                                    "user_name":this.data.user_data_vals[0],
                                    "email":this.data.user_data_vals[1],
                                    "password":this.data.user_data_vals[2],
                                    "address":this.data.user_data_vals[3]
                                })
                                
                                //Using a then method in which a function is called to display the success message
                                .then(()=>{
                                    swal({

                                        //Icon, and text attributes
                                        icon:"success",
                                        text:"You are ready to go!",

                                        //Buttons attribute
                                        buttons:{
                                        proceed:{
                                            text:"Proceed"
                                        }
                                    }
                                    })

                                    //Assigning the verified email to a component attribute
                                    this.data.user_email=this.data.user_data_vals[1]
                                  })
                                  :

                                  //Calling custom defined function that displays a modifiable error message
                                  this.errorPromptAndReturnToHome("At least enter something rather than nothing!")      
                            })
                            :

                            //Calling custom defined function that displays a modifiable error message
                            this.errorPromptAndReturnToHome("At least enter something rather than nothing!")
                        })
                        :

                        //Calling custom defined function that displays a modifiable error message
                        this.errorPromptAndReturnToHome("Either your email is blank or it does not contain the suffix '@gmail.com'")
                        })
                        :

                        //Calling custom defined function that displays a modifiable error message
                        this.errorPromptAndReturnToHome("At least enter something rather than nothing!")
                    })
                }
            })

            //Sourcing the email div tag and setting the name attribute of it to the user's email id
            email_div=document.getElementById("div_eml")
            email_div.setAttribute("name",this.data.user_email)
            //Sourcing the division tag housing the buttons and temporarily removing it
            div=document.getElementById("div_btn_in")
            div.style.display="none"
        },

        //Defining a function to assess the parameters, and return their boolean validity
        assessParameters:function(val,type){

            //Verifying whether the length of the parameter is greater than 0 or not
            ////Case-1 -The length of the parameter is greater than 0
            if(val.length>0){

                //Verifying whether the type of the parameter is 1 or 0
                ////Case-1 -The type of the parameter is 1
                if(type===1){

                    //Verifying whether the parameter has the gmail.com suffix and is has a length greater than 10
                    ////Case-1 -The parameter has the gmail.com suffix and is has a length greater than 10
                    if(val.includes("@gmail.com") && val.length>10){

                        //Returning a true value
                        return true
                    }


                    ////Case-2 -Else case
                    else{

                        //Returning a false value
                        return false
                    }
                }

                ////Case-2 --The type of the parameter is 0
                else if(type===0){

                    //Returning a true value
                    return true
                }
            }

            ////Case-2 -The length of the parameter is lesser than 0
            else{

                //Returning a false value
                return false
            }
        },

        //Defining a function to dispaly and  update the orders list limited to the user
        manageAndDisplayOrdersList: async function(email_param){

            //Sourcing all documents from the collection "orders" that match the user's email ~~(x)
            var orders= await firebase.firestore().collection("orders").where("email","==",email_param).get().then((snapshot)=>{
                return snapshot.docs.map(doc=>doc.data())
            })
            
            //Creating a constant that is the parent div container for the table 
            const content=document.createElement("div")

            //Verifying whether the length of the orders  at (x)

            ////Case-1 -The length is greater than 0
            if(orders.length>0){

                //Setting the overflow attribute to the container
                content.setAttribute("overflow-y","auto")

                //Creating a table element and setting a table-condensed class to it
                table_el=document.createElement("table")
                table_el.setAttribute("class","table table-condensed")

                //Appending the table as a child to the content tag
                content.appendChild(table_el)

                //Creating the th tags and setting their texts, and for some their ids

                ////For Serial number
                th_tag_index=document.createElement("th")
                th_tag_index.innerHTML="No."

                ////For Time of order
                th_tag_time=document.createElement("th")
                th_tag_time.innerHTML="Time of Order"

                ////For Automobile name
                th_tag_name=document.createElement("th")
                th_tag_name.innerHTML="Automobile"

                ////For Quantity
                th_tag_quantity=document.createElement("th")
                th_tag_quantity.innerHTML="Quantity"

                ////For Grand Total
                th_tag_total=document.createElement("th")
                th_tag_total.innerHTML="Final Total"
                th_tag_total.setAttribute("id","th_total")

                //Appending all the aforementioned elements to the table tag as children
                table_el.appendChild(th_tag_index)
                table_el.appendChild(th_tag_time)
                table_el.appendChild(th_tag_name)
                table_el.appendChild(th_tag_quantity)
                table_el.appendChild(th_tag_total)

                //Delcaring a new variable that will be the order index
                var order_index=0

                //Mapping the orders at (x)
                orders.map(order=>{
                    
                    //Incrementing the order index by 1
                    order_index+=1

                    //Creating a tr tag 
                    tr_tag=document.createElement("tr")

                    //Creating the td tags and setting their texts, and for some their ids

                    ////For Serial number
                    td_tag_index=document.createElement("td")
                    td_tag_index.innerHTML=order_index

                    ////For Time of order
                    td_tag_date=document.createElement("td")
                    td_tag_date.innerHTML=this.convertTime(order["time"].toMillis())
                    td_tag_date.setAttribute("id","td_time")

                    ////For Automobile name
                    td_tag_car=document.createElement("td")
                    td_tag_car.innerHTML=order["car"]
                    td_tag_car.setAttribute("id","td_car")

                    ////For Quantity
                    td_tag_quantity=document.createElement("td")
                    td_tag_quantity.innerHTML=order["quantity"]

                    ////For Grand Total
                    td_tag_price=document.createElement("td")
                    td_tag_price.innerHTML="$"+order["quantity"]*order["price"]
                    
                    //Appending all the aforementioned elements to the tr tag as children
                    tr_tag.appendChild(td_tag_index)
                    tr_tag.appendChild(td_tag_date)
                    tr_tag.appendChild(td_tag_car)
                    tr_tag.appendChild(td_tag_quantity)
                    tr_tag.appendChild(td_tag_price)
                    
                    //Appending the tr tag as a child to the table tag
                    table_el.appendChild(tr_tag) 
            })
            }

            ////Case-2 -Else case
            else{

                //Creating an img tag and setting an icon as src to it
                image=document.createElement("img")
                image.setAttribute("src","icons/not_found.jpeg")
                image.setAttribute("width","75%")

                //Appending the image tag as a child to the content tag
                content.appendChild(image)

                //Creating a h6 tag and stting its text 
                h6_1=document.createElement("h6")
                h6_1.innerHTML="It seems a bit empty over here."

                //Appending the h6 tag as a child to the content tag
                content.appendChild(h6_1)

                //Creating a h6 tag and stting its text 
                h6_2=document.createElement("h6")
                h6_2.innerHTML="Do you want it to remain that way?"

                //Appending the h6 tag as a child to the content tag
                content.appendChild(h6_2)  
            }
        
            //Displaying a sweet alert modal to display the orders
            swal({

                //Title attribute
                title:"Orders",
                
                //Buttons attribute
                buttons:{
                    refresh:{
                        text:"Refresh",
                        value:"refresh"
                    },
                    cancel:true
                },

                //Custom html component
                content,
                
                //Overflow attribute
                overflow:true
            })
            
            //Using a then method to assess the button pressed
            .then((btn_value)=>{

                /*
                Ternary operator used
                The button pressed is refresh->True 
                The button pressed is not refresh, but cancel->False
                */

                btn_value==="refresh"? this.manageAndDisplayOrdersList(email_param):null
            })   
        },

        //Defining a function to convert a given milliecond string to dd-mm-yyyyy hh:mm:ss format
        convertTime:function(time_param){

            //Declaring a new date object
            date=new Date(time_param)

            /*
                Ternary operator used
                Seconds are greater than 9->True 
                Seconds are lesser than 9->False
            */

            seconds=date.getSeconds()>9?date.getSeconds():`0${date.getSeconds()}`

            /*
                Ternary operator used
                Minutes are greater than 9->True 
                Minutes are lesser than 9->False
            */

            minutes=date.getMinutes()>9?date.getMinutes():`0${date.getMinutes()}`

            /*
                Ternary operator used
                Hours are greater than 9->True 
                Hours are lesser than 9->False
            */

            hours=date.getHours()>9?date.getHours():`0${date.getHours()}`


            //Returning the date in the dd-mm-yyyyy hh:mm:ss
            return date.getDate()+'-'+(parseInt(date.getMonth())+1)+'-'+date.getFullYear()+"     \n  "+"   "+hours+":"+minutes+":"+seconds
        },

        //Defining a function to display the customized error prompt and to return to the inital sweet alert modal
        errorPromptAndReturnToHome:function(error){

            //Displaying a sweet alert modal to notify the user about failure
            swal({

                //Icon and text attributes
                icon:"error",
                text:error
            })
            
            //Using a then method in which a function is called to recall the login and sign up procedures function
            .then(()=>{

                //Recalling the login and sign up procedures function
                this.initiateLoginAndSignUpPrompt()

                //Setting the array responsible for holding user credentials to empty
                this.data.user_data_vals=[]
            })
        },

        //Defining a function to display the customized error prompt 
        errorPrompt:function(error){

            //Displaying a sweet alert modal to notify the user about failure
            swal({

                //Icon and text attributes
                icon:"error",
                text:error
            })
        }, 
})


//--------------------------------------------------------------------buttons.js-----------------------------------------------------------------//
//----------------------------------------------------------------Automobiles Galore----------------------------------------------------------------//
//----------------------------------------------------------------------C-168----------------------------------------------------------------//