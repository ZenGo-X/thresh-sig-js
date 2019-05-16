extern crate server_lib;

use neon::prelude::*;
use self::server_lib::server::*;

pub fn p1_launch_server(mut cx: FunctionContext) -> JsResult<JsString> {
    get_server().launch();
    Ok(cx.string("success"))
}