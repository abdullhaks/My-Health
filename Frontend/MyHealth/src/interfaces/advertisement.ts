export interface ILocation {
    type: "Point";
    coordinates:[number,number];
    text:string;
};

export interface advertisement {
        _id?: string;
        title:string;
        videoUrl: string;
        location:ILocation;
        author: string;
        authorId:string;
        tags: [];
        pack?:string;
        fee?: number ;
        views?:number;
        clicks?:number;
        expDate?:Date;
        createdAt?: string | Date | undefined;


      
}

