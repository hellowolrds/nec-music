import React, { Component} from 'react';
import * as api from '../../api'
import qs from 'query-string'
import {Spin} from 'antd'
import {Link} from 'react-router-dom'
import {pos} from '../../util/dom'
import { Pagination } from 'antd';
import {numberFormat} from '../../util'

class User extends Component {
	constructor(props) {
		super(props);
		this.state = {
			userprofiles:[],
			total:0,
			keywords:'',
			currPage:1,
			queryCorrected:null
		}
		this.choosePage = (page,pageSize) => {
			this.setState({
				currPage:page,
				userprofiles:[]
			})
			const query = qs.parse(this.props.location.search)
			const keywords = query.keywords	
			api.search(keywords,1002,page-1).then(res => {
				if(res.data.code == 200) {
					this.setState({
						userprofiles:res.data.result.userprofiles
					})
					const sp = pos(document.getElementById('search_result'))
					window.scrollTo.apply(null,sp)
				}
			})
		}
	}
	componentDidMount() {
		const keywords = qs.parse(this.props.location.search).keywords
		if(keywords === undefined) {
			return false
		}
		this.setState({
			keywords:keywords
		})
		api.search(keywords,1002).then(res => {
			console.log(res)
			if(res.data.code == 200) {
				this.setState({
					userprofiles:res.data.result.userprofiles,
					total:res.data.result.userprofileCount,
					queryCorrected:res.data.result.queryCorrected
				})
			}
		})
	}
	componentWillReceiveProps(nextProps) {
		const keywords = qs.parse(nextProps.location.search).keywords
		if(keywords === undefined || keywords == this.state.keywords) {
			return false
		}
		this.setState({
			keywords:keywords,
			userprofiles:[],
			total:0,
			currPage:1,
			queryCorrected:null
		})
		api.search(keywords,1002).then(res => {
			// console.log(res)
			if(res.data.code == 200) {
				this.setState({
					userprofiles:res.data.result.userprofiles,
					total:res.data.result.userprofileCount,
					queryCorrected:res.data.result.queryCorrected
				})
			}
		})
	}
	render() {
		const {userprofiles,total,keywords,currPage,queryCorrected} = this.state
		return (
			<div className="ztag n-srchrst f-pr" id="search_result">
				<div className="snote s-fc4 ztag">
					搜索“{keywords}”，找到 <em className="s-fc6">{total}</em> 个用户
					{queryCorrected?<span>，您是不是要搜：<Link className="s-fc7" to={`/search/song?keywords=${queryCorrected}`}>{queryCorrected}</Link></span>:null}
				</div>
				<table className="m-table m-table-2 m-table-2-cover">
					<tbody>
						{
							userprofiles.length?userprofiles.map((i,index) =>
								<tr key={index}>
									<td className="w7">
										<div className="u-cover u-cover-3">
											<Link to={`/user/home?id=${i.userId}`}>
												<img src={i.avatarUrl}/>
												<span className="msk" title={i.nickname}></span>
											</Link>
										</div>
									</td>
									<td>
										<div className="ttc">
											<Link to={`/user/home?id=${i.userId}`} title={i.nickname} className="txt f-fs1">
												<span
												dangerouslySetInnerHTML={{__html:i.nickname.replace(new RegExp(keywords,'gi'),rs =>`<span class="s-fc7">${rs}</span>`)}}	
												></span>
												{i.userType?<sup className="u-icn2 u-icn2-music2"></sup>
												:i.authStatus?<sup className="u-icn u-icn-1"></sup>:null}
												{i.gender === 1?<i className="icnfix u-icn u-icn-s-01 f-sep"></i>
												:i.gender === 2?<i className="icnfix u-icn u-icn-s-02 f-sep"></i>:null}
											</Link>
										</div>
										<div className="dec s-fc4 f-thide" title={i.signature}
										dangerouslySetInnerHTML={{__html:i.signature.replace(new RegExp(keywords,'gi'),rs =>`<span class="s-fc7">${rs}</span>`)}}	
										></div>
									</td>
									<td className="w9">
										<a className="u-btn u-btn-3 f-tdn" href="javascript:void(0)"><i>关注</i></a>
									</td>
									<td className="w9 s-fc4">歌单：{i.playlistCount}</td>
									<td className="w9 s-fc4">粉丝：<span>{numberFormat(i.followeds)}</span></td>
								</tr>
							):<tr style={{height:'300px'}} className="loading"><td><Spin tip="Loading..." /></td></tr>
						}
					</tbody>
				</table>
				<div className="u-page" style={{display:total<=30?'none':'block'}}>
					<Pagination onChange={this.choosePage} current={currPage}   pageSize={30} total={total} />
				</div>
			</div>
			
		);
	}
}

export default User