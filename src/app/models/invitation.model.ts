export interface Invitation {
    id: number;             
    project: {
      id: number;
      title: string;
    };                      
    invited_user: {
      id: number;
      username: string;
    };                     
    status: 'pending' | 'accepted' | 'rejected'; 
    created_at: string;   
  }
  