# What is *firebase-easy-query*

Firebase Easy Query (feq) is a small and simple library that goal simplify the traditional coding to manipulate Firebase database.

It's a proposal to try make easy and comprensible queries to Firebase.

Feq is thinked for beginners developers and small projects or simple developments.
## Contents
- [What is *firebase-easy-query*](#what-is-firebase-easy-query)
  - [Contents](#contents)
  - [Install](#install)
  - [Adding feq to your JS project.](#adding-feq-to-your-js-project)
  - [Instancing feq](#instancing-feq)
  - [Members](#members)
  - [On(string)](#onstring)
  - [Create([string], object)](#createstring-object)
  - [Append(object)](#appendobject)
  - [Update(*object*)](#updateobject)
  - [From(string)](#fromstring)
  - [GetSnapshot()](#getsnapshot)
  - [GetValue()](#getvalue)
  - [Delete()](#delete)
  - [Remove(key, [condition])](#removekey-condition)
  - [CopyTo(string)](#copytostring)
  - [MoveTo(string)](#movetostring)
  - [From(string).SelectFor([...args])](#fromstringselectforargs)
  - [From(string).Select(...args).Where(conditions)](#fromstringselectargswhereconditions)
  - [Operators](#operators)

<a name="install"></a>
## Install
```bash
npm install firebase-easy-query --save
```

**If you are developing with Google Cloud Functions sure you are using Node 8 engine.**

<a name="adding"></a>
## Adding feq to your JS project.

```js
const { feq, operator } = require("firebase-easy-query");
```

<a name="instancing"></a>
## Instancing feq

Using a serviceAccountKey.json file

```js
const serviceAccount = require("./serviceAccountKey.json");

const config = {
    credential: serviceAccount,
    databaseUrl: "https://your-firebase-db.firebaseio.com"
};

const db = new feq(config);
```

Specifying only the database name

```js
const config = {
    databaseUrl: "https://your-firebase-db.firebaseio.com"
};

const db = new feq(config);
```

Using default credentials.

```js
const db = new feq();
```

Setup firebase access config to instance using:
- Firebase JSON file config.
- initializeApp method.

**Example**
``` js
const serviceAccount = require("myServiceAccountKey.json");
const config = {
    credential: serviceAccount,
    databaseUrl: "https://my-firebase-database.firebaseio.com"
};

const db = new feq(config);
```
<a name="setroot"></a>
##Setting root node with SetRoot property

Use **SetRoot** property when you neeed setup a particular node as root.

```js
db.SetRoot = '/my/Root/Path'
```
 **Important notes:**
- When you set value for root, all queries will be executed over this path.
- If you don't set this property it use '/' as root or don't set a value.

<a name="members"></a>
## Members

**feq** was wrote to use an intuitive syntax, to achieve it is use two single methods: **On()** and **From()**.

<a name="setroot"></a>
## On(string)

On() is a function that can use to create, delete, append or remove objects and single nodes over an custom or specific path.

Syntaxis

```js
 db.On(path)

 db.On('/my/example/path')
```
<a name="create"></a>
## Create([string], object)
Create a data set using a js object.
```js
 let singleUserData = {
     fullName: "Victor Carbajal",
     age: 17,
     address: "Noth #98, CA"
 };

 db.On('/my/Single/Path').Create(singleUserData);
```
`Create` function has one overload that is useful to specify the firebase key node name:
```js
 let singleUserData = {
     fullName: "Victor Carbajal",
     age: 17,
     address: "Noth #98, CA"
 };

 // in this case, it uses "customString" to named to dataset in singleUserData object.
 db.On('/my/Single/Path').Create('customString', singleUserData);
```
<a name="append"></a>
## Append(object)
This function adds a new node with its value to an exists object

```js
let myNode = {
	name: "Tom Smith",
    age: 32
};

db.On('/path/anyNode').Append(myNode);

// Or...

db.On('/path/anyNode').Append({ name: "Tom Smith", age: 32 });
```
<a name="rename"></a>
##Rename(*object*)
Re-sets the node name specified at the end part of path.

**Mandatory object:**
```js
{ oldName: "oldOrOriginalValue", newName: "newValue" }
```
```js
db.On(`/users/real`).Rename({ oldName: "user", newName: "user01" });
```
<a name="update"></a>
## Update(*object*)
Updates the value of a node represent by the value of the `On` function parameter.
```js
db.On(`/users/real/user01`).Update({ email: "jhonexamples@my-email.net" });
```
<a name="from"></a>
## From(string)

Provides a set of functions that allow to you set new items on existing data. Specify the path to access to data tree that you wish affect.

<a name="snapshot"></a>
## GetSnapshot()

`This function returns a promise.`

Retrieves an object that represents an typically Firebase snapshot under *once('value')* statement.
```js
let GetSnapshot = async () => {
    let snapshot = await db.From('/alphabetic/Alpha').GetSnapshot();
    let values = snapshot.val();
    let key = snapshot.key;
}
```
<a name="value"></a>
## GetValue()

`This function returns a promise.`

Retrieves the value or object contained in the snapshot.

This function would be equivalent to invoke `val()` method from Firebase snapshot.

```js
let GetValue = async () => {
    let value = await db.From('/alphabetic/Alpha').GetValue();
}
```
<a name="delete"></a>
## Delete()
Deletes the path specified inside `From` function.

Internally this action sets a `null` value.
 ```js
 // deletea the full tree accesible by '/my/Single/Path' path.
 db.From('/my/Single/Path').Delete();
 ```
 <a name="remove"></a>
## Remove(key, [condition])

Remove the node in the tree data using the `From(path)` and the specific node name (key parameter).

To consider all  nodes to find in object located in path you can use the character `*` (asterisk) as value for the `key` parameter.

Remove a node with a specific value, use the where object:

**NOTE**

**The** `where` **object is NOT compatible with** `conditions` **object of** `Where` **member.**

```js
{
    where: {
        operator: operator.$eq,
        value: 'target-value'
    }
}

db.From(`/users/real`).Remove('*', {
    where: {
        operator: operators.$eq,
        value: true
    }
});
```
<a name="copyto"></a>
## CopyTo(string)
This function creates a copy of data located in the path specified in `From` parameter, the new location will be that you set in the `CopyTo` function parameter.
```js
db.From('/original/path').CopyTo('/my/New/Path');
```
<a name="moveto"></a>
## MoveTo(string)
This function creates a copy from data in the specified path in `From`, then deletes the original data setting a `null` value.
```js
db.From('/original/path').MoveTo('/my/New/Path');
```
<a name="selectfor"></a>
## From(string).SelectFor([...args])
Returns a set of objects whose values coincides with the key-names requested in `SelectFor` function.

To get all results from a snapshot, don't set a value for the `args` parameter of the `SelectFor` function.
<a name="queriable"></a>
## From(string).Select(...args).Where(conditions)

**Select**: use this function to specify the properties or keys names (separated by commas) that you want retrieve.

To get all results from a snapshot, don't set a value for the `args` parameter of the `Select` function.

When you specify a set of names the process returns one or more (an array of) object with this properties.

If a property does not exists the default value in the returned object will be a empty string.
```js
Select("name", "age", "address")

// This strings produce an object similar to
{
	name: any,
    age: any,
    address any
}
```

Retrieve a dataset using a object that contains property name to compare, operator and value.

```js
let conditions = {
    where: {
        key: "name",
        operator: operator.$eq,
        value: "Richard"
    }
}

db.From('/users/user01').Select("name", "age", "address").Where(conditions);
```
<a name="operators"></a>
## Operators
Usage:
```js
const { operator } = require("firebase-easy-query");
```

- Use **`$eq`** for *equals to*
- Use **`$gt`** for *great than*
- Use **`$ge`** for *greater-than or equals*
- Use **`$lt`** for *less than*
- Use **`$le`** for *less-than or equals*
