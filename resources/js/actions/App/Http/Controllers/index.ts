import Api from './Api'
import PreviewProxyController from './PreviewProxyController'
import ProjectController from './ProjectController'
import FileController from './FileController'
import AssetController from './AssetController'
import PublishController from './PublishController'
import AIController from './AIController'

const Controllers = {
    Api: Object.assign(Api, Api),
    PreviewProxyController: Object.assign(PreviewProxyController, PreviewProxyController),
    ProjectController: Object.assign(ProjectController, ProjectController),
    FileController: Object.assign(FileController, FileController),
    AssetController: Object.assign(AssetController, AssetController),
    PublishController: Object.assign(PublishController, PublishController),
    AIController: Object.assign(AIController, AIController),
}

export default Controllers