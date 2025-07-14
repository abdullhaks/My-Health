

export default interface IDirectDocUploadS3Service {
    
    directUpload(file: { buffer: Buffer; originalname: string; mimetype: string },
      location: string):Promise<{ message: string; url: string }>
 
    
}