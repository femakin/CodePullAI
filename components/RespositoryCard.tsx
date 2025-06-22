import React from 'react'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { CheckCircle } from 'lucide-react'

const RespositoryCard = ({repo, toggleWebhook, installationID} : {repo : any, toggleWebhook : (repoId : number) => void, installationID : string}) => {


    const onToggleWebhook = async ( repoId: number, repoName: string, repoOwner: string ) => {
      
        window.open(`https://github.com/settings/installations/${installationID}`, '_blank', 'noopener,noreferrer');
    }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
    <div className="flex-1">
      <div className="flex items-center space-x-2 mb-1">
        <h3 className="font-semibold">{repo.name}</h3>
        {repo.private && (
          <Badge variant="secondary" className="text-xs">
            Private
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {repo.language}
        </Badge>
      </div>
      <p className="text-sm text-slate-600 mb-2">{repo.description}</p>
      <p className="text-xs text-slate-500">{repo.full_name}</p>
    </div>

    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-600">AI Reviews</span>
        <Switch checked={repo.webhook_enabled} onCheckedChange={() => onToggleWebhook(repo.id, repo.name, repo.owner)} />
      </div>
      {repo.webhook_enabled && (
        <Badge variant="default" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )}
    </div>
  </div>
  )
}

export default RespositoryCard
