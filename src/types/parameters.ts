export class RigParameters {    
    constructor(public azResources: AzResources, public azDevOps : AzDevOps, public gitParams: GitParams) {

    }
}

export class AzResources {
   // appName: string;


    constructor(public baseResourceGroupName: string, public appServiceName: string, public location: string){ 
    }
}

export class AzDevOps {
    constructor(public username: string,
        public pat: string,
        public orgName: string,
        public projName: string,
        public projId: string){}
}

export class GitParams {
    constructor(public pat: string, public org: string, public repo: string){}
}

