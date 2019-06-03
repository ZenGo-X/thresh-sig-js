extern crate kms;
extern crate curv;

extern crate serde;
extern crate serde_json;
extern crate client_lib;

use neon::prelude::*;
use self::client_lib::api::*;
use self::kms::ecdsa::two_party::MasterKey2;
use self::curv::BigInt;

struct KeyGenTask {
    p1_endpoint: String,
}

struct SignTask {
    p1_endpoint: String,
    msg_hash: BigInt,
    mk: MasterKey2,
    x: BigInt,
    y: BigInt,
    id: String,
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

    let party_two_master_key: MasterKey2 = serde_json::from_str(&cx.argument::<JsString>(0)?.value()).unwrap();
    let x: BigInt = serde_json::from_str(&cx.argument::<JsString>(1)?.value()).unwrap();
    let y: BigInt = serde_json::from_str(&cx.argument::<JsString>(2)?.value()).unwrap();

    let child_master_key = party_two_master_key.get_child(vec![x, y]);

    Ok(cx.string(serde_json::to_string(&child_master_key).unwrap()))
}

pub fn sign(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let expected_args = 7;
    if cx.len() != expected_args {
        return cx.throw_error("Invalid number of arguments");
    }

    let p1_endpoint: String = cx.argument::<JsString>(0)?.value();
    let msg_hash: BigInt = serde_json::from_str(&cx.argument::<JsString>(1)?.value()).unwrap();
    let mk: MasterKey2 = serde_json::from_str(&cx.argument::<JsString>(2)?.value()).unwrap();
    let x: BigInt = serde_json::from_str(&cx.argument::<JsString>(3)?.value()).unwrap();
    let y: BigInt = serde_json::from_str(&cx.argument::<JsString>(4)?.value()).unwrap();
    let id: String = cx.argument::<JsString>(5)?.value();
    let cb = cx.argument::<JsFunction>(6)?;

    let task = SignTask { p1_endpoint, msg_hash, mk, x, y, id };
    task.schedule(cb);

    Ok(cx.undefined())
}

impl Task for SignTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let client_shim = ClientShim::new(self.p1_endpoint.to_string(), None);
        let signature = client_lib::api::sign(&client_shim, self.msg_hash.clone(), &self.mk, self.x.clone(), self.y.clone(), &self.id);
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
        let master_key_client = get_master_key(&client_shim);
        Ok(serde_json::to_string(&master_key_client).unwrap())
    }

    fn complete(self, mut cx: TaskContext, result: Result<Self::Output, Self::Error>) -> JsResult<Self::JsEvent> {
        Ok(cx.string(result.unwrap()))
    }
}

