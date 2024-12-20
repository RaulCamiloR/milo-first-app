const { DynamoDBClient } = require ("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } = require ("@aws-sdk/lib-dynamodb");

// Create a DynamoDB client
const client = new DynamoDBClient({ region: process.env.REGION }); 

// Create a DynamoDB document client
const docClient = DynamoDBDocumentClient.from(client);

const { v4: uuid4 } = require("uuid")

exports.newVideogame = async(event)=>{
    try {

        console.log(event)
        const { title, year } = JSON.parse(event.body)

        if(!title || !year){
            throw new Error("Missing fields")
        }

        const id = uuid4()

        const game = {
            id,
            title, 
            year
        }

        const gamedb = await saveItemToDynamoDB(game)

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: gamedb
            })
        }
        
    } catch (error) {
        console.log(error)

        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message })
        }
    }
}

exports.getVideogame = async(event)=>{
    try {

        const { id } = event.pathParameters

        const params = {
            TableName: process.env.VIDEOGAMES_TABLE,
            Key: { id }
        };
        const command = new GetCommand(params);
        
        const response = await docClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: response
            })
        }
        
    } catch (error) {
        console.log(error)

        return {
            statusCode: 400,
            body: JSON.stringify({ message: error.message })
        }
    }
}

const saveItemToDynamoDB = async (item) => {

    const params = {
      TableName: process.env.VIDEOGAMES_TABLE,
      Item: item
    };
  
    console.log(params);
  
    try {
      const command = new PutCommand(params);
      const response = await docClient.send(command);
      console.log("Item saved successfully:", response);
      return response;
    } catch (error) {
      console.error("Error saving item:", error);
      throw error;
    }
}

