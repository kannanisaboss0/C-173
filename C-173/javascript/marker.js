//--------------------------------------------------------------------C-168--------------------------------------------------------------------//
//--------------------------------------------------------------------Automobiles Galore--------------------------------------------------------------------//
//--------------------------------------------------------------------marker.js--------------------------------------------------------------------//


//Registering acomponent to handle marker events
AFRAME.registerComponent("handle-marker",{

    //Schema
    schema:{
        assorted_vals:{type:"array",default:[]},
    },

    //Calling an init function
    init: async function(){

        //Sourcing the button division tag
        div=document.getElementById("div_btn_in") 

        //Sourcing the purchase button tag
        purchase_button=document.getElementById("purchase_btn")
    
        //Sourcing the rate button tag
        rate_button=document.getElementById("rate_btn")    
   
        //Adding an event listener for when the marker is found
        this.el.addEventListener("markerFound", async ()=>{

            //Declaring a variable that is assigned the automobile list
            var automobile= await this.getAutomobiles(this.el.id);

            //Choosing the first index of the automobile list
            automobile=automobile[0]

            //Finding the   number of automobiles in stock for the current automobile 
            automobiles_in_stock=automobile["in_stock"]
        
            //Sourcing a property from another component which contains the user email
            button_comp=document.querySelector("#scene_wrld").getAttribute("button-renderer")
            user_email=button_comp.user_email

            //Calling a function that collects and modifies the information into a presentable form
            this.modifyInfoData(automobile)

            //Verifying if the integer-converted value of the automobiles is greater than 0

            ////Case-1 -The integer-converted value of the automobiles is greater than 0
            if(parseInt(automobiles_in_stock)>0){

                //Making the divsion tag visible
                div.style.display="flex"

                //Souricng the marker element and making it visible
                marker_el=document.querySelector("#pagani_mrkr_sb")
                marker_el.setAttribute("visible","true")

                //Adding an event listener for the purchase button
                purchase_button.addEventListener("click",()=>{

                //Displaying a sweet alert modal to display the corresponding purchase information
                swal({

                    closeOnEsc:false,
                    closeOnClickOutside:false,
                
                    //Icon, title, and text attributes
                    icon:"./icons/shopping_cart.png",
                    title:"PURCHASE",
                    text:`Price: \n USD: $3,500 \n INR: ₹ 2,71,778 \n [import duties included] \n In Stock: ${automobile["in_stock"]} `,

                    //Buttons attribute
                    buttons:{
                        confirm:{
                            text:"Purchase"
                        },
                        cancel:true
                    },

                    //Content attribute for the input
                    content:{
                        element:"input",
                        attributes:{
                            placeholder:"Enter the quantity", 
                        }
                    }   
                    })

                //Using the then method upon in which an async function is called for adding the order data
                .then( async(input_value)=>{

                    //Sourcing the automobiles data
                    automobile=await this.getAutomobiles(this.el.id);

                    //Choosing the first index of the automobile list
                    automobile=automobile[0]

                    //Finding the number of automobiles in stock
                    automobiles_in_stock=automobile["in_stock"]

                    //Verifying  whether the value inputted by the user is greater than or equal to 1 but lesser than or equal to the number of automobiles in stock

                    ////Case-1 -The value inputted by the user is greater than or equal to 1 and lesser than or equal to the number of automobiles in stock
                    if(parseInt(input_value)>=1 && parseInt(input_value)<=parseInt(automobiles_in_stock)){

                        //Adding a new odcument to the collection "orders" ~~(ix)
                        firebase.firestore().collection("orders").add({
                            "email":user_email,
                            "quantity":parseInt(input_value),
                            "time":firebase.firestore.FieldValue.serverTimestamp(),
                            "car":"Pagani Huayra BC" ,
                            "price":automobile["price_calc"],
                            "id":document.id
                        })
                        
                        //Using the then method in which a function is called for afforming the user of success
                        .then(()=>{
                            swal({
                                "icon":"success",
                                "text":`Purchase Successful! ${parseInt(automobile["price_calc"]*parseInt(input_value))} has been transferred `,
                                "buttons":false,
                                "timer":1500
                            })

                            //Decrementing the number of automobiles in stock, with accordnace to the user-inputted amount
                            firebase.firestore().collection("automobiles").doc(automobile["doc_id"]).update({
                                "in_stock":firebase.firestore.FieldValue.increment(-input_value)
                            })
                        })
                    }

                    ////Case-2 -Else case
                    else if(input_value===null){
                        swal({
                            icon:"error",
                            title:"Purchase Unsuccesful",
                            
                        })
                    }

                    ////Case-2 -Else case
                    else {

                        //Calling the function to indicate error
                        this.errorPrompt("Please keep in mind the amount remaining in stock (and also porbably enter a valid input)!")
                    }
                })
            })
            
            //Adding an event listener for the info button    
            button_info.addEventListener("click",()=>{

            //Displaying a sweet alert modal to display the corresponding info information
            swal({

                //Icon, title, and text attributes
                icon:"./icons/pagani_logo.png",
                title:"Huayra BC",
                text:this.data.assorted_vals.sort().reverse().join("\n")   
            })
        })

            //Adding an event listener for the rate button
            rate_button.addEventListener("click",()=>{
                this.handleRating(automobile)
            })
            }

            ////Case-2 -Else case
            else{
              
                //Displaying an alert, mentioing the inavailability of the autmobile
                window.alert("Sorry, out of stock!","No Problem!")    
            }    
            })

        //Adding an event listener for when the marker is lost
        this.el.addEventListener("markerLost",()=>{

            //Making the divsion tag invisible
            div.style.display="none"
            this.data.assorted_vals=[]
        }) 
    },
    
    //Defining a function to modify the data for the info sweet alert modal
    modifyInfoData: async function(automobile_param){

        //Sourcing the key and values of the variable, holding a dicitonary, at (i)
        key_vals=Object.keys(automobile_param.info_modal["specs"]) //~~(ii)
        value_vals=Object.values(automobile_param.info_modal["specs"]) //~~(iii)
        
        //Running a for loop over the keys of the dicitonary at (i)
        for (key_ele of key_vals){
               //Delcaring a new variable that has equal values to the one at (ii) ~~(iv)
               key_ele_changed=key_ele
        
        //Running a for loop over every single alphabet of every key      
        for(alphabet in key_ele){

            //Replacing the "_" values in the varaible at (iv), if any
            key_ele_changed=key_ele_changed.replace("_"," ")   
        }

        //Pushing the aforementioned avlues in the form of a dicitonary into component property (^i)
        this.data.assorted_vals.push(`${key_ele_changed}:${value_vals[key_vals.indexOf(key_ele)]}`)
    }
    },

    //Defining a function to avail a specific automobile list from the database
    getAutomobiles: async function(id_param){

        //Collecting data from firestore
        return  firebase.firestore().collection("automobiles").where("id","==",id_param).get().then((snapshot)=>{
           return snapshot.docs.map((doc)=> doc.data()
            )
        })
    },
    
    //Defining a function to display the customized error prompt 
    errorPrompt:function(error_param){

        //Displaying a sweet alert modal to notify the user about failure
        swal({

            //Icon and text attributes
            icon:"error",
            text:error_param
        })
    }, 


    //Defining a function to handle the rating mechanism
    handleRating: async function(automobile_param){

        //Sourcing the prdocut name tag and setting its text to the automobile's name
        product_text=document.getElementById("rating_prod_nm")
        product_text.innerHTML=`Product: ${automobile_param["name"]}`

        //Setting the name attribute of the aforementioned tag to the automobile's
        product_text.setAttribute("name",automobile_param["name"])

        //Sourcing the rating modal tag and setting its display to block
        rating_modal=document.getElementById("rating_mdl")
        rating_modal.style.display="block"

        //Collecting data form the database ~~(v)
        var ratings= await firebase.firestore().collection("ratings").where("id","==",automobile_param["id"]).get().then((snapshot)=>{
          return snapshot.docs.map(doc=>doc.data())
        })

        //Souricng the rating intorduction tag and accessing the rating score, a child of its 
        rating_introduction=document.getElementById("rating_intro")
        rating_scr=rating_introduction.children[2]

        //Verifying whether the length of the rating list at (v)
        ////Case-1 -The length of teh rating list is greater than 0
        if(ratings.length>0){
        
        //Assigning a variable to the number of ratings 
        rating_number=ratings.length 

        //Declaring a varialbe for the sum of the rating values
        rating_sum=0
        
        //Mapping over the variable derived at (v)
        ratings.map(rating=>rating_sum+=parseFloat(rating["rating"]))

        //Finding the average rating value ~~(vi)
        var average_rating=rating_sum/rating_number

        //Setting the text value to a concatenated list consisting of the value attained at (vi)
        rating_scr.innerHTML=`${average_rating.toFixed(2)}/5`
        }

        ////Case-2 ~Else case
        else{
            
            //Setting the  value to rating score to 0
            rating_scr.innerHTML="0.00/5"   
        }       
    }
})


//--------------------------------------------------------------------marker.js--------------------------------------------------------------------//
//--------------------------------------------------------------------Automobiles Galore--------------------------------------------------------------------//
//--------------------------------------------------------------------C-168--------------------------------------------------------------------//