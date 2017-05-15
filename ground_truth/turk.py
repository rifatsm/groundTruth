import sys, os, base64, datetime, hashlib, hmac
import json
import requests  # pip install requests

# Not all builds will have Mturk
try:
    host = os.environ["HOST"]
    endpoint = os.environ["endpoint"]
    access_key = os.environ["ACCESS_KEY"]
    secret_key = os.environ["SECRET_KEY"]

    HITTypeId = os.environ["HITTypeId"]
    HITLayoutId = os.environ["HITLayoutId"]
except KeyError:
    print("\nFailed to load mturk config vars\n")

# Determine if we can use MTURK
USE_MTURK = False
try:
    if os.environ["USE_MTURK"] == "True":
        USE_MTURK = True
        print("\nusing mturk\n")
    else:
        print("\nnot using mturk\n")
except KeyError:
    print("\nnot using mturk\n")


#####################################################################################!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
##!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
##!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# TODO this code is modified from:
# http://docs.aws.amazon.com/general/latest/gr/sigv4-signed-request-examples.html#sig-v4-examples-post
# TODO I suggest you read the the above python guide before modifying this code

# TODO this code does this operation:
# http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateHITWithHITTypeOperation.html


def sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def getSignatureKey(key, date_stamp, regionName, serviceName):
    kDate = sign(('AWS4' + key).encode('utf-8'), date_stamp)
    kRegion = sign(kDate, regionName)
    kService = sign(kRegion, serviceName)
    kSigning = sign(kService, 'aws4_request')
    return kSigning


def add_mturk_task(region, token):
    if not USE_MTURK:
        # TODO this returns the value from this function that is expected without creating tasks
        return True

    # region id `underscore` token for region
    param = str(region) + "_" + str(token)

    method = 'POST'
    service = 'mturk-requester'
    region = 'us-east-1'
    content_type = 'application/x-amz-json-1.1'
    amz_target = 'MTurkRequesterServiceV20170117.CreateHITWithHITType'  # the api call that we want to make
    request_parameters = '{"HITTypeId": "' + HITTypeId + '","HITLayoutId": "' + HITLayoutId + '"'  # the task template
    request_parameters += ',"HITLayoutParameters": [{"Name":"Task", "Value":'

    # TODO the 'everything' value is used because MTURK does not allow '&' to be in the strings for the API call
    # TODO instead we seporate the region number and toke to access it by an underscore
    request_parameters += '"https://groundtruth-study3.herokuapp.com/search/?everything=' + param + '"}],'
    request_parameters += '"LifetimeInSeconds": 604800,"MaxAssignments": 3}'

    t = datetime.datetime.utcnow()
    amz_date = t.strftime('%Y%m%dT%H%M%SZ')
    date_stamp = t.strftime('%Y%m%d')

    canonical_uri = '/'
    canonical_querystring = ''
    canonical_headers = 'content-type:' + content_type + '\n' + 'host:' + host + '\n' + 'x-amz-date:' + amz_date + '\n' + 'x-amz-target:' + amz_target + '\n'
    signed_headers = 'content-type;host;x-amz-date;x-amz-target'
    payload_hash = hashlib.sha256(request_parameters).hexdigest()
    canonical_request = method + '\n' + canonical_uri + '\n' + canonical_querystring + '\n' + canonical_headers + '\n' + signed_headers + '\n' + payload_hash
    algorithm = 'AWS4-HMAC-SHA256'
    credential_scope = date_stamp + '/' + region + '/' + service + '/' + 'aws4_request'
    string_to_sign = algorithm + '\n' + amz_date + '\n' + credential_scope + '\n' + hashlib.sha256(
        canonical_request).hexdigest()
    signing_key = getSignatureKey(secret_key, date_stamp, region, service)
    signature = hmac.new(signing_key, (string_to_sign).encode('utf-8'), hashlib.sha256).hexdigest()
    authorization_header = algorithm + ' ' + 'Credential=' + access_key + '/' + credential_scope + ', ' + 'SignedHeaders=' + signed_headers + ', ' + 'Signature=' + signature
    headers = {'Content-Type': content_type,
               'X-Amz-Date': amz_date,
               'X-Amz-Target': amz_target,
               'Authorization': authorization_header}
    r = requests.post(endpoint, data=request_parameters, headers=headers)

    # if the request failed for any reason then return false.
    if r.status_code != 200 and r.status_code != "200":
        print(r.text)
        return False
    else:
        return True

##!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
##!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
##!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
