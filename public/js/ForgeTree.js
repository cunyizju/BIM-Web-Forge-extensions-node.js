/*
*
*Send data from frontend to modelderivative.js
*Including functions：
*1.Create, view and delete bucket(folder)
   文件夹创建、查看、删除
*2.Create, translate, view and delete object(file)
   文件创建、转码、查看、删除
*3.refresh the forge tree automatically
   构件树变更提醒、自动刷新
*
*/

$(document).ready(function () {
    prepareAppBucketTree();
    $("#refreshBuckets").click(function () {
        $("#appBuckets").jstree(true).refresh()
    });
    $("#createNewBucket").click(function () {
        createNewBucket()
    });
    $("#createBucketModal").on("shown.bs.modal", function () {
        $("#newBucketKey").focus()
    });
    $("#hiddenUploadField").change(function () {
        var node = $("#appBuckets").jstree(true).get_selected(true)[0];
        var _this = this;
        if (_this.files.length == 0) {
            return
        }
        var file = _this.files[0];
        switch (node.type) {
            case "bucket":
                var formData = new FormData();
                formData.append("fileToUpload", file);
                formData.append("bucketKey", node.id);
                $.ajax({
                    url: "/api/forge/oss/objects",
                    data: formData,
                    processData: false,
                    contentType: false,
                    type: "POST",
                    success: function (data) {
                        $("#appBuckets").jstree(true).refresh_node(node);
                        _this.value = ""
                    }
                });
                break
        }
    })
});

function createNewBucket() {
    var bucketKey = $("#newBucketKey").val();
    var policyKey = $("#newBucketPolicyKey").val();
    $.post({
        url: "/api/forge/oss/buckets",
        contentType: "application/json",
        data: JSON.stringify({
            "bucketKey": bucketKey,
            "policyKey": policyKey
        }),
        success: function (res) {
            $("#appBuckets").jstree(true).refresh();
            $("#createBucketModal").modal("toggle")
        },
        error: function (err) {
            if (err.status == 409) {
                alert("Bucket already exists- 409: Duplicated")
            }
            console.log(err)
        }
    })
}

function prepareAppBucketTree() {
    $("#appBuckets").jstree({
        "core": {
            "themes": {
                "icons": true
            },
            "data": {
                "url": "/api/forge/oss/buckets",
                "dataType": "json",
                "multiple": false,
                "data": function (node) {
                    return {
                        "id": node.id
                    }
                }
            }
        },
        "types": {
            "default": {
                "icon": "glyphicon glyphicon-question-sign"
            },
            "#": {
                "icon": "glyphicon glyphicon-cloud"
            },
            "bucket": {
                "icon": "glyphicon glyphicon-folder-open"
            },
            "object": {
                "icon": "glyphicon glyphicon-file"
            }
        },
        "plugins": ["types", "state", "sort", "contextmenu"],
        contextmenu: {
            items: autodeskCustomMenu
        }
    }).on("loaded.jstree", function () {
        $("#appBuckets").jstree("open_all")
    }).bind("activate_node.jstree", function (evt, data) {
        if (data != null && data.node != null && data.node.type == "object") {
            $("#forgeViewer").empty();
            var urn = data.node.id;
            getForgeToken(function (access_token) {
                $.ajax({
                    url: "https://developer.api.autodesk.com/modelderivative/v2/designdata/" + urn + "/manifest",
                    headers: {
                        "Authorization": "Bearer " + access_token
                    },
                    success: function (res) {
                        if (res.status === "success") {
                            launchViewer(urn)
                        } else {
                            $("#forgeViewer").html("" + res.progress + "")
                        }
                    },
                    error: function (err) {
                        var msgButton = "This file is not translated yet! " + '<button class="btn btn-xs btn-info" onclick="translateObject()"><span class="glyphicon glyphicon-eye-open"></span> ' + "Start translation</button>";
                        $("#forgeViewer").html(msgButton)
                    }
                })
            })
        }
    })
}

function autodeskCustomMenu(autodeskNode) {
    var items;
    switch (autodeskNode.type) {
        case "bucket":
            items = {
                uploadFile: {
                    label: "Upload",
                    action: function () {
                        $("#hiddenUploadField").click()
                    },
                    icon: "glyphicon glyphicon-cloud-upload"
                },
                deleteBucket: {
                    label: "Delete bucket",
                    action: function () {
                        //Delete Confirmation
                        if (confirm("Deleted bucket can not be recovered, are you sure to delete it?")) {
                            var treeNode = $("#appBuckets").jstree(true).get_selected(true)[0];
                            deleteBucket(treeNode);
                        }
                    },
                    icon: 'glyphicon glyphicon-trash'
                }
            };
            break;
        case "object":
            items = {
                translateFile: {
                    label: "Translate",
                    action: function () {
                        var treeNode = $("#appBuckets").jstree(true).get_selected(true)[0];
                        translateObject(treeNode)
                    },
                    icon: "glyphicon glyphicon-eye-open"
                },
                deleteFile: {
                    label: "Delete Object",
                    action: function () {
                        if (confirm("Deleted object can not be recovered, are you sure to delete it?")) {
                            var treeNode = $("#appBuckets").jstree(true).get_selected(true)[0];
                            deleteButton(treeNode);
                        }
                    },
                    icon: 'glyphicon glyphicon-trash'
                },
                downloadFile: {
                    label: "Download Object",
                    action: function () {
                        if (confirm("Wait for a seconds, are you ready to download it?")) {
                            var treeNode = $("#appBuckets").jstree(true).get_selected(true)[0];
                            downloadButton(treeNode);
                        }
                    },
                    icon: 'glyphicon glyphicon-cloud-download '
                }
            };
            break
    }
    return items
}

// ...........................................................................................................................//
//Delete Bucket：If the Bucket has objects，both of Bucket and objects will be deleted.
//API example：bucketsApi.deleteBucket(bucketKey, oauth2client, credentials)
//In fact, only bucketKey is needed to send to the server.
function deleteBucket(node) {
    $("#forgeViewer").empty();
    if (node == null) {
        node = $("#appBuckets").jstree(true).get_selected(true)[0]
    }
    //bucketKey example：FORGE_CLIENT_ID-folderName，如shhqivs2oicadgghpgvxdc0hdzsuqa3x-deletetest
    var bucketKey = node.id;
    $.post({
        url: "/api/forge/modelderivative/jobs/deletebucket",
        contentType: "application/json",
        data: JSON.stringify({
            "bucketKey": bucketKey
        }),
        success: function (res) {
            //Refresh the Forge tree after 2 seconds...............................
            setTimeout(() => {
                $("#appBuckets").jstree(true).refresh();
            }, 2000);
            $("#forgeViewer").html("Object has been deleted.");
        },
    })
}
// ...........................................................................................................................//
//delete object
//API example：objectsApi.deleteObject(bucketKey,fileName,oAuth2TwoLegged, oAuth2TwoLegged.getCredentials())
function deleteButton(node) {
    $("#forgeViewer").empty();
    if (node == null) {
        node = $("#appBuckets").jstree(true).get_selected(true)[0]
    }
    //bucketKey example:FORGE_CLIENT_ID-folderName，for example, shhqivs2oicadgghpgvxdc0hdzsuqa3x-deletetest
    //RealName example:Real name of object, such as: xionganBIM2020.rvt
    var bucketKey = node.parents[0];
    var RealName = node.text;
    $.post({
        url: "/api/forge/modelderivative/jobs/deleteobject",
        contentType: "application/json",
        data: JSON.stringify({
            "bucketKey": bucketKey,
            "fileRealName": RealName
        }),
        success: function (res) {
            setTimeout(() => {
                $("#appBuckets").jstree(true).refresh();
            }, 2000);
            $("#forgeViewer").html("Object has been deleted.");
        },
    })
}

// ...........................................................................................................................//
//Object transaltion
function translateObject(node) {
    $("#forgeViewer").empty();
    if (node == null) {
        node = $("#appBuckets").jstree(true).get_selected(true)[0]
    }
    var bucketKey = node.parents[0];
    var objectKey = node.id;
    $.post({
        url: "/api/forge/modelderivative/jobs",
        contentType: "application/json",
        data: JSON.stringify({
            "bucketKey": bucketKey,
            "objectName": objectKey
        }),
        success: function (res) {
            $("#forgeViewer").html("Start transaltion. Wait for a moment, please.")
        },
    })
};

// ...........................................................................................................................//
//Download Object：
function downloadButton(node){

}