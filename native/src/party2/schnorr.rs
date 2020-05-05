extern crate serde;
extern crate serde_json;
extern crate client_lib;

use neon::prelude::*;
use self::client_lib::schnorr::Share;
use self::client_lib::{BigInt, ClientShim};

struct KeyGenTask {
    p1_endpoint: String,
}

struct SignTask {
    p1_endpoint: String,
    msg_hash: BigInt,
    share: Share,
}

pub fn generate_key(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let expected_args = 2;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let p1_endpoint: String = cx.argument::<JsString>(0)?.value();
    let cb = cx.argument::<JsFunction>(1)?;

    let task = KeyGenTask { p1_endpoint };
    task.schedule(cb);

    Ok(cx.undefined())
}

pub fn sign(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let expected_args = 4;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let p1_endpoint: String = cx.argument::<JsString>(0)?.value();
    let msg_hash: BigInt = serde_json::from_str(&cx.argument::<JsString>(1)?.value()).unwrap();
    let share: Share = serde_json::from_str(&cx.argument::<JsString>(2)?.value()).unwrap();
    let cb = cx.argument::<JsFunction>(3)?;

    let task = SignTask { p1_endpoint, msg_hash, share };
    task.schedule(cb);

    Ok(cx.undefined())
}

impl Task for SignTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let client_shim = ClientShim::new(self.p1_endpoint.to_string(), None);
        let signature = client_lib::schnorr::sign(&client_shim, self.msg_hash.clone(), &self.share).unwrap();
        Ok(serde_json::to_string(&signature).unwrap())
    }

    fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
        Ok(cx.string(result.unwrap()))
    }
}

impl Task for KeyGenTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let client_shim = ClientShim::new(self.p1_endpoint.to_string(), None);
        let share = client_lib::schnorr::generate_key(&client_shim).unwrap();
        Ok(serde_json::to_string(&share).unwrap())
    }

    fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
        Ok(cx.string(result.unwrap()))
    }
}