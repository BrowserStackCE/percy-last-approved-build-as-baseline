const Axios = require('axios').default
const percyToken = process.env.PERCY_READ_TOKEN || process.env.PERCY_TOKEN 
const projectSlug = process.env.PERCY_PROJECT_SLUG

const axios = Axios.create({
    baseURL: "https://percy.io/api/v1",
    headers: {
        Authorization: `Token ${percyToken}`
    },
    responseType: "json"
})

function _fetchProject() {
    return axios.get("/projects", {
        params: {
            project_slug: projectSlug
        }
    }).then((res) => {
        if (res.status == 200) {
            return res.data
        } else {
            throw res.data
        }
    })
}

function _fetchBuilds(options) {
    let { project_id, cursor } = options;
    return axios.get("/builds", {
        params: {
            project_id: project_id,
            "filter[state]": "finished",
            "page[limit]": 100,
            "page[cursor]": cursor || undefined
        }
    }).then((res) => {
        if (res.status == 200) {
            return res.data
        } else {
            throw res.data
        }
    })
}

async function _findLastApprovedBuild() {
    let projectDetails = await _fetchProject();
    let projectId = projectDetails.data?.['id']
    // Assuming build to be under last 100 builds created
    let res = await _fetchBuilds({ project_id: projectId })
    let lastApprovedBuild = res.data?.find((b) => b.attributes['review-state'] == 'approved');
    return lastApprovedBuild
}


(async () => {
    let lastApprovedBuild = await _findLastApprovedBuild()
    if(!lastApprovedBuild) return;
    let baseBranch = lastApprovedBuild.attributes['branch']
    let commitUrl = lastApprovedBuild.attributes['commit-html-url']
    let commitId = commitUrl?.substring(commitUrl?.lastIndexOf('/') + 1, commitUrl.length);
    if (commitId && baseBranch) {
        console.log(`##vso[task.setvariable variable=PERCY_TARGET_BRANCH]${baseBranch}`)
        console.log(`##vso[task.setvariable variable=PERCY_TARGET_COMMIT]${commitId}`)
    }else{
        console.warn("No base commit found");
    }
})()

