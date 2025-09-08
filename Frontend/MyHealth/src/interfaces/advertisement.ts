export interface ILocation {
    type: "Point";
    coordinates:[number,number];
    text:string;
};

export interface advertisement {
    
        title:string,
        videoUrl: string,
        location:ILocation
        author: string,
        authorId:string
        tags: [],
      
}