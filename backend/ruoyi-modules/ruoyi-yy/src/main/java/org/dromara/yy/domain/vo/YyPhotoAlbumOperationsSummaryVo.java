package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 客片相册运营排障聚合视图。
 */
@Data
public class YyPhotoAlbumOperationsSummaryVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 相册ID
     */
    private Long albumId;

    /**
     * 底片总数
     */
    private Long totalAssets;

    /**
     * 客户可见底片数
     */
    private Long visibleAssets;

    /**
     * 已选底片数
     */
    private Long selectedAssets;

    /**
     * 可见但缺 OSS Key 的底片数
     */
    private Long missingObjectKeyAssets;

    /**
     * 最近失败访问
     */
    private RecentFailureVo recentFailure;

    @Data
    public static class RecentFailureVo implements Serializable {

        @Serial
        private static final long serialVersionUID = 1L;

        /**
         * 访问动作
         */
        private String action;

        /**
         * 失败备注
         */
        private String remark;

        /**
         * 访问时间
         */
        private Date createTime;
    }
}
