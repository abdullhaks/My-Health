

export default interface IDirectDocUploadS3Service {
    
    directUpload(doc:any,location:string):Promise<any>
 
    
}