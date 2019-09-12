extern crate serde;
extern crate serde_json;
extern crate client_lib;

use neon::prelude::*;
use self::client_lib::ecdsa::*;
use self::client_lib::{BigInt, ClientShim};

struct KeyGenTask {
    p1_endpoint: String,
}

struct SignTask {
    p1_endpoint: String,
    msg_hash: BigInt,
    share: PrivateShare,
    x: BigInt,
    y: BigInt,
}

pub fn generate_master_key(mut cx: FunctionContext) -> JsResult<JsUndefined> {
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

pub fn get_child_share(mut cx: FunctionContext) -> JsResult<JsString> {
    let expected_args = 3;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let party2_master_key_share: PrivateShare = serde_json::from_str(&cx.argument::<JsString>(0)?.value()).unwrap();
    let x: BigInt = serde_json::from_str(&cx.argument::<JsString>(1)?.value()).unwrap();
    let y: BigInt = serde_json::from_str(&cx.argument::<JsString>(2)?.value()).unwrap();

    let party2_child_share = party2_master_key_share.get_child(vec![x, y]);

    Ok(cx.string(serde_json::to_string(&party2_child_share).unwrap()))
}

pub fn sign(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let expected_args = 6;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let p1_endpoint: String = cx.argument::<JsString>(0)?.value();
    let msg_hash: BigInt = serde_json::from_str(&cx.argument::<JsString>(1)?.value()).unwrap();
    let share: PrivateShare = serde_json::from_str(&cx.argument::<JsString>(2)?.value()).unwrap();
    let x: BigInt = serde_json::from_str(&cx.argument::<JsString>(3)?.value()).unwrap();
    let y: BigInt = serde_json::from_str(&cx.argument::<JsString>(4)?.value()).unwrap();
    let cb = cx.argument::<JsFunction>(5)?;

    let task = SignTask { p1_endpoint, msg_hash, share, x, y };
    task.schedule(cb);

    Ok(cx.undefined())
}

impl Task for SignTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let client_shim = ClientShim::new(self.p1_endpoint.to_string(), None);
        let signature = client_lib::ecdsa::sign(
                &client_shim,
                self.msg_hash.clone(),
                &self.share.master_key,
                self.x.clone(),
                self.y.clone(),
                &self.share.id)
            .expect("ECDSA signature failed");
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
        let master_key_share = get_master_key(&client_shim);
        Ok(serde_json::to_string(&master_key_share).unwrap())
    }

    fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
        Ok(cx.string(result.unwrap()))
    }
}

