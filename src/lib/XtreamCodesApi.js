import { checkCache, cacheIt } from "./common";

export const XtreamCodesApi = function (host, username, password, proxy = "") {
    this.host = host;
    this.username = username;
    this.password = password;
    this.proxy = proxy;
    console.log("logged in", this);

    this.get_link = (channel, mode = "live") => {
        if(mode == "live") return `${this.host}/live/${this.username}/${this.password}/${channel.stream_id}.${channel.ext}`;
        if(mode == "vod") return `${this.host}/movie/${this.username}/${this.password}/${channel.stream_id}.${channel.ext}`;
    };

    this.get_live_categories = async () => {
        return await this.get(
            this.host,
            "/player_api.php",
            {
                username: this.username,
                password: this.password,
                action: "get_live_categories",
            },
            (response) => response.body()
        );
    };
    this.get_vod_categories = async () => {
        return await this.get(
            this.host,
            "/player_api.php",
            {
                username: this.username,
                password: this.password,
                action: "get_vod_categories",
            },
            (response) => response.json()
        );
    };
    this.get_series_categories = async () => {
        return await this.get(
            this.host,
            "/player_api.php",
            {
                username: this.username,
                password: this.password,
                action: "get_series_categories",
            },
            (response) => response.json()
        );
    };
    this.get_live_streams = async (category_id = null) => {
        let params = {
            username: this.username,
            password: this.password,
            action: "get_live_streams",
        };
        if (category_id !== null) params.category_id = category_id;
        return await this.get(this.host, "/player_api.php", params);
    };
    this.get_vod_streams = async () => {
        let params = {
            username: this.username,
            password: this.password,
            action: "get_vod_streams",
        };
        return await this.get(this.host, "/player_api.php", params);
    };
    this.get_series_streams = async () => {
        let params = {
            username: this.username,
            password: this.password,
            action: "get_series",
        };
        return await this.get(this.host, "/player_api.php", params);
    };
    this.get_vod_info = async (vod_id) => {
        return await this.get(this.host, "/player_api.php", {
            username: this.username,
            password: this.password,
            action: "get_vod_info",
            vod_id: vod_id,
        });
    };
    this.get_series_info = async (series_id) => {
        return await this.get(this.host, "/player_api.php", {
            username: this.username,
            password: this.password,
            action: "get_series_info",
            series_id: series_id,
        });
    };

    this.get_short_epg = async (stream_id) => {
        return await this.get(this.host, "/player_api.php", {
            username: this.username,
            password: this.password,
            action: "get_short_epg",
            stream_id: stream_id,
        });
    };
    this.get_simple_data_table = async (stream_id) => {
        return await this.get(this.host, "/player_api.php", {
            username: this.username,
            password: this.password,
            action: "get_simple_data_table",
            stream_id: stream_id,
        });
    };
    this.get = async (
        urlstring,
        path,
        parameters,
        content = "application/json"
    ) => {
        let url = new URL(urlstring + path);
        url.search = new URLSearchParams(parameters).toString();
        let data = checkCache(url);
        if (data !== null) return data;
        let firefox = navigator.userAgent.search("Firefox") > -1 ? true : false;
        if (firefox) {
            data = await this.xhr("GET", url, content);
            if (data === null) {
                await new Promise((r) => setTimeout(r, 500));
                data = await this.xhr("GET", url, content);
            }
        }
        if (data === null) {
            let req = await fetch(this.proxy + url, {
                redirect: "follow",
                referrerPolicy: "no-referrer",
                headers: { "Content-Type": content },
            });
            data = await req.json();
        }
        if (data !== null) {
            cacheIt(url, data);
            return data;
        }

    };
    this.xhr = (method, url, content = "application/json") => {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.overrideMimeType(content);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    resolve(null);
                }
            };
            xhr.onerror = function () {
                resolve(null);
            };
            xhr.send();
        });
    };
};
