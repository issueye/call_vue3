export namespace config {
	
	export class AppConfig {
	    Title: string;
	    Width: number;
	    Height: number;
	    MinWidth: number;
	    MinHeight: number;
	    MaxWidth: number;
	    MaxHeight: number;
	    DisableResize: boolean;
	    Fullscreen: boolean;
	    Frameless: boolean;
	    AlwaysOnTop: boolean;
	    BackgroundColor: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Title = source["Title"];
	        this.Width = source["Width"];
	        this.Height = source["Height"];
	        this.MinWidth = source["MinWidth"];
	        this.MinHeight = source["MinHeight"];
	        this.MaxWidth = source["MaxWidth"];
	        this.MaxHeight = source["MaxHeight"];
	        this.DisableResize = source["DisableResize"];
	        this.Fullscreen = source["Fullscreen"];
	        this.Frameless = source["Frameless"];
	        this.AlwaysOnTop = source["AlwaysOnTop"];
	        this.BackgroundColor = source["BackgroundColor"];
	    }
	}
	export class LoggingConfig {
	    Level: string;
	    Output: string;
	    FilePath: string;
	
	    static createFrom(source: any = {}) {
	        return new LoggingConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Level = source["Level"];
	        this.Output = source["Output"];
	        this.FilePath = source["FilePath"];
	    }
	}
	export class ProcessConfig {
	    ExePath: string;
	    Port: number;
	    Args: string;
	    StartRetry: number;
	    RetryDelay: number;
	
	    static createFrom(source: any = {}) {
	        return new ProcessConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ExePath = source["ExePath"];
	        this.Port = source["Port"];
	        this.Args = source["Args"];
	        this.StartRetry = source["StartRetry"];
	        this.RetryDelay = source["RetryDelay"];
	    }
	}
	export class Config {
	    App: AppConfig;
	    Process: ProcessConfig;
	    Logging: LoggingConfig;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.App = this.convertValues(source["App"], AppConfig);
	        this.Process = this.convertValues(source["Process"], ProcessConfig);
	        this.Logging = this.convertValues(source["Logging"], LoggingConfig);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

export namespace logger {
	
	export class LoggerImpl {
	
	
	    static createFrom(source: any = {}) {
	        return new LoggerImpl(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

