exports.handler = (event, context, callback, intentRequest) => {

    if (event.currentIntent.name === "Greetings" && event.invocationSource === "DialogCodeHook") {
        callback(null, {
            "dialogAction": {
                "type": "Delegate",
            }
        });
    }
    
    if (event.currentIntent.name === "AgentConnect") {
        var province = event.currentIntent.slots.Province;
        var town = event.currentIntent.slots.Town;
        
        var validatedTown = validationTown(town, province);
        
        // const sessionId = event.sessionId + '-' + Date.now();
        
        let attempts = event.sessionAttributes && event.sessionAttributes.attempts ? parseInt(event.sessionAttributes.attempts) : 4;
        
        if (event.invocationSource === "DialogCodeHook") {
            
            if (province == null && town == null) {
                callback(null, {
                    "sessionAttributes": {
                        "attempts": attempts.toString()
                    },
                    "dialogAction": {
                        "type": "ElicitSlot",
                        "message": {
                            "contentType": "PlainText",
                            "content": "What province are you in?"
                        },
                        "intentName": "AgentConnect",
                        "slots": {     
                            "Province": province,
                            "Town": town
                        },
                        "slotToElicit" : "Province"
                    }
                });
            } else if (province != null && town == null) {
                callback(null, {
                    "sessionAttributes": {
                        "attempts": attempts.toString()
                    },
                    "dialogAction": {
                        "type": "ElicitSlot",
                        "message": {
                            "contentType": "PlainText",
                            "content": "In which town are you?"
                        },
                        "intentName": "AgentConnect",
                        "slots": {     
                            "Province": province,
                            "Town": town
                        },
                        "slotToElicit" : "Town"
                    }
                });
            } else if (!validatedTown) {
                attempts--;
                if (attempts > 0) {
                    let message = "Check if the town is correct. You have " + attempts + " attempts left. In which town are you?";
                    callback(null, {
                        "sessionAttributes": {
                            "attempts": attempts.toString()
                        },
                        "dialogAction": {
                            "type": "ElicitSlot",
                            "message": {
                                "contentType": "PlainText",
                                "content": message
                                // "content": "Check if the town is correct. In which town are you?"
                            },
                            "intentName": "AgentConnect",
                            "slots": {     
                                "Province": province,
                                "Town": town
                            },
                            "slotToElicit" : "Town"
                        }
                    });
                } else {
                    
                    attempts = 4;
                    callback(null, {
                        "sessionAttributes": {
                            "attempts": attempts.toString()
                        },
                        "dialogAction": {
                            "type": "Delegate",
                            "slots": {     
                                "Province": province,
                                "Town": town
                            }
                        }
                    });

                    // attempts = 4;
                    // callback(null, {
                    //     "sessionAttributes": {
                    //         "attempts": attempts.toString()
                    //     },
                    //     "dialogAction": {
                    //         "type": "Close",
                    //         "fulfillmentState": "Failed",
                    //         "message": {
                    //             "contentType": "PlainText",
                    //             "content": "Sorry, I could not validate your town. What else can I help you with?"
                    //         },
                    //         "responseCard": {
                    //             "contentType": "application/vnd.amazonaws.card.generic",
                    //             "version": 1,
                    //             "genericAttachments": [
                    //                 {
                    //                     "title": "Fill in this form",
                    //                     "subTitle": "https://ui.chill.ie/motor/",
                    //                     'imageUrl': 'https://i.ibb.co/MVwd4vt/1.jpg',
                    //                     'attachmentLinkUrl': 'https://ui.chill.ie/motor/',
                    //                     "buttons": [
                    //                         {
                    //                             "text": "Start over",
                    //                             "value": "Hello"
                    //                         },
                    //                         {
                    //                             "text": "Full test",
                    //                             "value": "I need New Home insurance in Dublin for Joe Brown on joe.brown@gmail.com"
                    //                         },
                    //                         {
                    //                             "text": "Agent connect",
                    //                             "value": "Connect to the agent"
                    //                         }
                    //                     ]
                    //                 }
                    //             ]
                    //         }
                    //     }
                    // });
                    
                    
                }
            } else if (validatedTown) {
                callback(null, {
                    "dialogAction": {
                        "type": "Delegate",
                        "slots": {     
                            "Province": province,
                            "Town": town
                        }
                    }
                });
            }
        }
        
        if (event.invocationSource === "FulfillmentCodeHook") {
            if (validatedTown) {
                callback(null, {
                    "dialogAction": {
                        "type": "Close",
                        "fulfillmentState": "Fulfilled",
                        "message": {
                            "contentType": "PlainText",
                            "content": "Connecting to the agent"
                        },
                        "responseCard": {
                            "contentType": "application/vnd.amazonaws.card.generic",
                            "version": 1,
                            "genericAttachments": [
                                {
                                "title": "Reconnect",
                                "subTitle": "Test again",
                                'imageUrl': 'https://i.ibb.co/MVwd4vt/1.jpg',
                                'attachmentLinkUrl': 'https://www.youtube.com/',
                                "buttons": [
                                    {
                                        "text": "Start over (+)",
                                        "value": "Speak to the person"
                                    },
                                    // {
                                    //   "type": "web_url",
                                    //   "url": "https://www.google.com/",
                                    //   "title": "MFQ"
                                    // },
                                    // {
                                    //     "text": "MFQ",
                                    //     "value": "https://ui.chill.ie/motor",
                                    //     "type": "web_url"
                                    // }
                                ]
                            }]
                        }// "responseCard": {
                    }
                });
            } else {
                callback(null, {
                    "dialogAction": {
                        "type": "Close",
                        "fulfillmentState": "Fulfilled",
                        "message": {
                            "contentType": "PlainText",
                            "content": "Wrong choice"
                        },
                        "responseCard": {
                            "contentType": "application/vnd.amazonaws.card.generic",
                            "version": 1,
                            "genericAttachments": [
                                {
                                "title": "Reconnect",
                                "subTitle": "Test again",
                                "buttons": [{
                                    "text": "Start over (-)",
                                    "value": "Connect to the agent"
                                    },{
                                    "text": "Start from scratch (-)",
                                    "value": "Hello"
                                    },]
                            }]
                        }// "responseCard": {
                    }
                });
            }
        }

    }

    if (event.currentIntent.name === "SelectInsuranceType") {
        if (event.invocationSource === "FulfillmentCodeHook") {
            var insurance = event.currentIntent.slots.Insurance;
            var order = event.currentIntent.slots.Order;
            var city = event.currentIntent.slots.City;
            var firstName = event.currentIntent.slots.FirstName;
            var lastName = event.currentIntent.slots.LastName;
            var email = event.currentIntent.slots.Email;
            var message;
            var contentTypeValue;
            
            if (event.outputDialogMode === 'Text') {
                contentTypeValue = 'PlainText';
        
                if (email !== null) {
                    message = "We have an excellent offer for " + firstName + 
                        " " + lastName + " to order " + order + " " + insurance + 
                        " insurance policy in " + city + 
                        " city. We will send the information on email: " + email + 
                        "! Just fill in the form https://ui.chill.ie/motor. Is there anything else I can do for you?";
                } else {
                    message = "We have an excellent offer for " + firstName + 
                        " " + lastName + " to order " + order + " " + insurance + 
                        " insurance policy in " + city + 
                        " city" + 
                        "! If you have additional questions, please call 014003400. Is there anything else I can do for you?";
                }
            } else {
                contentTypeValue = 'SSML';
                
                if (email !== null) {
                    message = "We have an excellent offer for " + firstName + 
                        " " + lastName + " to order " + order + " " + insurance + 
                        " insurance policy in " + city + 
                        " city. We will send the information on email: " + email + 
                        "! If you have additional questions, please call 014003400. Is there anything else I can do for you?";
                } else {
                    message = "We have an excellent offer for " + firstName + 
                        " " + lastName + " to order " + order + " " + insurance + 
                        " insurance policy in " + city + 
                        " city" + 
                        "! If you have additional questions, please call 014003400. Is there anything else I can do for you?";
                }
            }
            
            callback(null, {
                "dialogAction": {
                    "type": "Close",
                    "fulfillmentState": "Fulfilled",
                    "message": {
                        "contentType": contentTypeValue,
                        "content": message
                    },
                    "responseCard": {
                        "contentType": "application/vnd.amazonaws.card.generic",
                        "version": 1,
                        "genericAttachments": [
                            {
                            "title": "Fill in this form",
                            "subTitle": "https://ui.chill.ie/motor/",
                            'imageUrl': 'https://i.ibb.co/MVwd4vt/1.jpg',
                            'attachmentLinkUrl': 'https://ui.chill.ie/motor/',
                            "buttons": [
                                {
                                    "text": "Start over",
                                    "value": "Hello"
                                },
                                {
                                    "text": "Full test",
                                    "value": "I need New Home insurance in Dublin for Joe Brown on joe.brown@gmail.com"
                                },
                                {
                                    "text": "Agent connect",
                                    "value": "Connect to the agent"
                                }
                            ]
                        },
                        {
                            "title": "Car",
                            "subTitle": "Order Car insurance policy",
                            "buttons": [{
                                "text": "New",
                                "value": "I need new car insurance"
                                }, {
                                "text": "Renew",
                                "value": "I need renew car insurance"
                                },]}, {
                            "title": "Life",
                            "subTitle": "Order Life insurance policy",
                            "buttons": [{
                                "text": "New",
                                "value": "I need new life insurance"
                                }, {
                                "text": "Renew",
                                "value": "I need renew life insurance"
                                },]}, {
                            "title": "Other",
                            "subTitle": "Start a conversation over",
                            "buttons": [{
                                    "text": "Start over",
                                    "value": "Hello"
                                }, {
                                    "text": "Order insurance",
                                    "value": "I need insurance"
                                },]}
                        ]
                    }// "responseCard": {
                }// "dialogAction": {
            });// callback(null, {
        }// if (event.invocationSource === "FulfillmentCodeHook") {
    }// if (event.currentIntent.name === "SelectInsuranceType") {
};// exports.handler = (event, context, callback) => {

function validationTown(town, province) {
    let connacht = ["Galway", "Leitrim", "Mayo", "Roscommon", "Sligo"];
    let leinster = ["Dublin", "Kildare", "Meath", "Wicklow", "Wexford"];
    let munster = ["Cork", "Limerick", "Kerry", "Waterford", "Clare"];
    let ulster = ["Donegal", "Cavan", "Monaghan"];
    let other = ["Kyiv", "London"];

    if (province === "Connacht" && connacht.includes(town)) {
        return true;
    } else if (province === "Leinster" && leinster.includes(town)) {
        return true;
    } else if (province === "Munster" && munster.includes(town)) {
        return true;
    } else if (province === "Ulster" && ulster.includes(town)) {
        return true;
    } else if (province === "Other country" && other.includes(town)) {
        return true;
    } else {
        return false;
    }
}
